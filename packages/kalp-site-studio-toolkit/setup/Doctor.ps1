[CmdletBinding()]
param([string]$SiteRoot = (Get-Location).Path, [string]$JsonReport)
$ErrorActionPreference = 'Stop'

function Test-WritableDirectory([string]$Path) {
  try {
    $candidate = [IO.Path]::GetFullPath($Path)
    if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $false }
    $existing = $candidate
    while ($existing -and -not (Test-Path -LiteralPath $existing -PathType Container)) {
      $parent = Split-Path -Parent $existing
      if ($parent -eq $existing) { return $false }
      $existing = $parent
    }
    if (-not $existing) { return $false }
    $probe = Join-Path $existing ('.kalp-write-probe-' + [Guid]::NewGuid().ToString('N'))
    [IO.File]::WriteAllText($probe, '')
    Remove-Item -LiteralPath $probe -Force
    return $true
  } catch { return $false }
}

function Invoke-Probe([string]$Executable, [string[]]$Prefix, [string[]]$Arguments) {
  try {
    $output = & $Executable @Prefix @Arguments 2>&1 | Out-String
    return [ordered]@{ ok = ($LASTEXITCODE -eq 0); output = $output.Trim(); exitCode = $LASTEXITCODE }
  } catch { return [ordered]@{ ok = $false; output = $_.Exception.Message; exitCode = $null } }
}

function Quote-CommandPart([string]$Value) {
  if ($Value -match '[\s''"]') { return "'$($Value.Replace("'", "''"))'" }
  return $Value
}

$root = [IO.Path]::GetFullPath($SiteRoot)
$packageJsonPath = Join-Path $root 'package.json'
$packageJsonPresent = Test-Path -LiteralPath $packageJsonPath -PathType Leaf
$packageJson = $null
if ($packageJsonPresent) { try { $packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json } catch { } }

$lockfile = $null
$manager = $null
$installArgs = @()
if (Test-Path -LiteralPath (Join-Path $root 'pnpm-lock.yaml')) {
  $manager = 'pnpm'; $lockfile = 'pnpm-lock.yaml'; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $root 'yarn.lock')) {
  $manager = 'yarn'; $lockfile = 'yarn.lock'; $installArgs = @('install', '--frozen-lockfile')
} elseif ((Test-Path -LiteralPath (Join-Path $root 'bun.lock')) -or (Test-Path -LiteralPath (Join-Path $root 'bun.lockb'))) {
  $manager = 'bun'; $lockfile = if (Test-Path -LiteralPath (Join-Path $root 'bun.lock')) { 'bun.lock' } else { 'bun.lockb' }; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $root 'package-lock.json')) {
  $manager = 'npm'; $lockfile = 'package-lock.json'; $installArgs = @('ci')
} else {
  $declared = if ($packageJson -and $packageJson.packageManager) { ([string]$packageJson.packageManager -split '@')[0] } else { $null }
  $manager = if ($declared -in @('pnpm', 'yarn', 'bun', 'npm')) { $declared } else { 'npm' }
  $installArgs = @('install')
}

$managerCommand = Get-Command $manager -ErrorAction SilentlyContinue | Select-Object -First 1
$corepackCommand = if ($manager -in @('pnpm', 'yarn')) { Get-Command corepack -ErrorAction SilentlyContinue | Select-Object -First 1 } else { $null }
$executable = $null
$prefix = @()
$invocationKind = 'unavailable'
if ($managerCommand) { $executable = $managerCommand.Source; $invocationKind = 'direct' }
elseif ($corepackCommand) { $executable = $corepackCommand.Source; $prefix = @($manager); $invocationKind = 'corepack' }

$versionProbe = [ordered]@{ ok = $false; output = ''; exitCode = $null }
$syntaxProbe = [ordered]@{ ok = $false; output = ''; exitCode = $null }
if ($executable) {
  $versionProbe = Invoke-Probe $executable $prefix @('--version')
  $syntaxArgs = if ($manager -eq 'npm') { @('help', 'ci') } else { @('install', '--help') }
  $syntaxProbe = Invoke-Probe $executable $prefix $syntaxArgs
}

$storePath = $null
$storeWritable = $null
$recommendedStorePath = $null
if ($manager -eq 'pnpm' -and $executable -and $versionProbe.ok) {
  $storeProbe = Invoke-Probe $executable $prefix @('store', 'path', '--silent')
  if ($storeProbe.ok -and $storeProbe.output) {
    $storePath = ($storeProbe.output -split "`r?`n" | Select-Object -Last 1).Trim()
    $storeWritable = Test-WritableDirectory $storePath
  } else { $storeWritable = $false }
  if (-not $storeWritable) {
    $rootHashBytes = [Text.Encoding]::UTF8.GetBytes($root.ToLowerInvariant())
    $sha = [Security.Cryptography.SHA256]::Create()
    $rootHash = ([BitConverter]::ToString($sha.ComputeHash($rootHashBytes))).Replace('-', '').Substring(0, 12).ToLowerInvariant()
    $tempBase = if ($env:TEMP) { $env:TEMP } else { [IO.Path]::GetTempPath() }
    $recommendedStorePath = Join-Path $tempBase "kalp-pnpm-store-$rootHash"
    if (-not (Test-WritableDirectory $recommendedStorePath)) { $recommendedStorePath = $null }
  }
}

$commandParts = @()
if ($executable -and $versionProbe.ok -and $syntaxProbe.ok) {
  $commandParts += '&'
  $commandParts += (Quote-CommandPart $executable)
  $commandParts += ($prefix | ForEach-Object { Quote-CommandPart $_ })
  $commandParts += ($installArgs | ForEach-Object { Quote-CommandPart $_ })
  if ($manager -eq 'pnpm' -and $storeWritable -eq $false -and $recommendedStorePath) {
    $commandParts += '--store-dir'; $commandParts += (Quote-CommandPart $recommendedStorePath)
  }
}
$verifiedCommand = if ($commandParts.Count) { $commandParts -join ' ' } else { $null }

$serviceUrl = [Environment]::GetEnvironmentVariable('KALP_SERVICE_URL')
$savedSetup = Join-Path $root '.kalp\site-studio.setup.json'
if (-not $serviceUrl -and (Test-Path -LiteralPath $savedSetup -PathType Leaf)) {
  try { $serviceUrl = (Get-Content -LiteralPath $savedSetup -Raw | ConvertFrom-Json).serviceUrl } catch { $serviceUrl = $null }
}
$serviceReady = $false
$healthEndpoint = $null
if ($serviceUrl -and $serviceUrl -match '^https?://') {
  foreach ($candidate in @('/health/live', '/health')) {
    try {
      $response = Invoke-WebRequest -Uri "$($serviceUrl.TrimEnd('/'))$candidate" -TimeoutSec 10 -UseBasicParsing
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) { $serviceReady = $true; $healthEndpoint = $candidate; break }
    } catch { }
  }
}

$project = [ordered]@{
  root = $root; packageJson = $packageJsonPresent; lockfile = $lockfile; packageManager = $manager
  packageManagerDeclared = if ($packageJson -and $packageJson.packageManager) { [string]$packageJson.packageManager } else { $null }
  siteStudioPackage = Test-Path -LiteralPath (Join-Path $root 'packages\kalp-site-studio-toolkit\package.json') -PathType Leaf
  siteManifest = Test-Path -LiteralPath (Join-Path $root '.kalp\site-studio.json') -PathType Leaf
}
$environment = [ordered]@{
  invocation = $invocationKind; executable = $executable; versionAvailable = [bool]$versionProbe.ok; version = $versionProbe.output
  installSyntaxValid = [bool]$syntaxProbe.ok; storePath = $storePath; storeWritable = $storeWritable; recommendedStorePath = $recommendedStorePath
}
$service = [ordered]@{ urlConfigured = [bool]$serviceUrl; ready = $serviceReady; healthEndpoint = $healthEndpoint }
$ready = $project.packageJson -and $project.siteStudioPackage -and $project.siteManifest -and $environment.versionAvailable -and $environment.installSyntaxValid -and ($storeWritable -ne $false -or [bool]$recommendedStorePath) -and $service.ready
$report = [ordered]@{
  schemaVersion = 'kalp.site-studio.doctor.v2'; checkedAt = [DateTime]::UtcNow.ToString('o'); project = $project
  environment = $environment; service = $service; recommendation = [ordered]@{ verifiedInstallCommand = $verifiedCommand }; ready = $ready
}

Write-Host 'Site Studio Doctor' -ForegroundColor Cyan
Write-Host "Project: $root"
Write-Host 'PROJECT STATE' -ForegroundColor Cyan
foreach ($item in $project.GetEnumerator()) { Write-Host "$($item.Key): $($item.Value)" }
Write-Host 'ENVIRONMENT STATE' -ForegroundColor Cyan
foreach ($item in $environment.GetEnumerator()) { Write-Host "$($item.Key): $($item.Value)" }
Write-Host 'SERVICE STATE' -ForegroundColor Cyan
foreach ($item in $service.GetEnumerator()) { Write-Host "$($item.Key): $($item.Value)" }
if ($verifiedCommand) {
  Write-Host 'VERIFIED INSTALL COMMAND (copy/paste from the project root):' -ForegroundColor Green
  Write-Host $verifiedCommand
} else {
  Write-Host "NO INSTALL COMMAND VERIFIED: '$manager' could not pass version and syntax probes through PATH or Corepack." -ForegroundColor Yellow
}
Write-Host "RESULT: $(if ($ready) { 'READY' } else { 'ATTENTION NEEDED' })" -ForegroundColor $(if ($ready) { 'Green' } else { 'Yellow' })
if ($JsonReport) {
  $report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath ([IO.Path]::GetFullPath($JsonReport)) -Encoding UTF8
  Write-Host "JSON report: $([IO.Path]::GetFullPath($JsonReport))"
}
if ($ready) { exit 0 } else { exit 10 }
