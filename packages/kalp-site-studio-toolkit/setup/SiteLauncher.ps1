[CmdletBinding()]
param(
  [string]$SiteRoot = (Get-Location).Path,
  [string]$SiteId,
  [string]$KalpServiceUrl,
  [ValidateSet("Local", "Live")]
  [string]$ApiProfile = "Local",
  [ValidateSet("Configure", "Start", "Build")]
  [string]$Mode = "Start",
  [int]$Port = 3000,
  [switch]$NonInteractive,
  [switch]$Force,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
Write-Host "Kalp Developer Toolkit - Site Launcher" -ForegroundColor Cyan
Write-Host "Scope: one website (not the Kalp OS Launcher)"

function Stop-Setup([string]$Message, [int]$Code = 1) {
  Write-Host "SETUP BLOCKED: $Message" -ForegroundColor Red
  exit $Code
}

function Read-EnvValue([string]$Path, [string[]]$Names) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $pair = $line -split '=', 2
    if ($Names -contains $pair[0].Trim()) {
      return $pair[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Get-TreeHash([string]$Path) {
  $files = Get-ChildItem -LiteralPath $Path -Recurse -File | Sort-Object FullName
  $lines = foreach ($file in $files) {
    $relative = $file.FullName.Substring($Path.Length).TrimStart('\', '/')
    "${relative}:$((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash)"
  }
  $bytes = [Text.Encoding]::UTF8.GetBytes(($lines -join "`n"))
  $sha = [Security.Cryptography.SHA256]::Create()
  return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '')
}

$resolvedRoot = [IO.Path]::GetFullPath($SiteRoot)
$packageJsonPath = Join-Path $resolvedRoot "package.json"
if (-not (Test-Path -LiteralPath $packageJsonPath -PathType Leaf)) {
  Stop-Setup "No package.json was found at '$resolvedRoot'. Run Setup from a JavaScript/TypeScript site root." 2
}

try { $sitePackage = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json }
catch { Stop-Setup "package.json is not valid JSON." 2 }

$dependencyNames = @()
if ($sitePackage.dependencies) { $dependencyNames += $sitePackage.dependencies.PSObject.Properties.Name }
if ($sitePackage.devDependencies) { $dependencyNames += $sitePackage.devDependencies.PSObject.Properties.Name }
$supported = @('next', 'react', 'vite', '@remix-run/react', 'astro') | Where-Object { $dependencyNames -contains $_ }
if (-not $supported) {
  Stop-Setup "Unsupported project type. This release supports Next.js, React/Vite, Remix, and Astro sites. No files were changed." 3
}

$manager = $null
$installArgs = @()
if (Test-Path -LiteralPath (Join-Path $resolvedRoot 'pnpm-lock.yaml')) {
  $manager = 'pnpm'; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $resolvedRoot 'yarn.lock')) {
  $manager = 'yarn'; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $resolvedRoot 'bun.lockb')) {
  $manager = 'bun'; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $resolvedRoot 'bun.lock')) {
  $manager = 'bun'; $installArgs = @('install', '--frozen-lockfile')
} elseif (Test-Path -LiteralPath (Join-Path $resolvedRoot 'package-lock.json')) {
  $manager = 'npm'; $installArgs = @('ci')
} else {
  $manager = 'npm'; $installArgs = @('install')
}
if (-not (Get-Command $manager -ErrorAction SilentlyContinue)) {
  Stop-Setup "Detected package manager '$manager' is not installed or not on PATH. No dependency command was run." 7
}

$setupDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundleRoot = Join-Path $setupDir ".site-studio-bundle\kalp-site-studio-toolkit"
if (-not (Test-Path -LiteralPath $bundleRoot -PathType Container)) {
  Stop-Setup "The bundled toolkit is missing. Re-extract the complete distribution ZIP." 4
}
$checksumPath = Join-Path $setupDir 'CHECKSUMS.sha256'
if (-not (Test-Path -LiteralPath $checksumPath -PathType Leaf)) {
  Stop-Setup "Bundle checksum file is missing. Re-download or re-extract the complete distribution." 4
}
foreach ($line in Get-Content -LiteralPath $checksumPath) {
  if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { continue }
  $parts = $line -split '\s+', 2
  if ($parts.Count -ne 2) { Stop-Setup "Bundle checksum file is malformed." 4 }
  $bundleFile = Join-Path $setupDir $parts[1]
  if (-not (Test-Path -LiteralPath $bundleFile -PathType Leaf)) { Stop-Setup "Bundle file '$($parts[1])' is missing." 4 }
  $actual = (Get-FileHash -LiteralPath $bundleFile -Algorithm SHA256).Hash
  if ($actual -ne $parts[0]) { Stop-Setup "Bundle checksum verification failed for '$($parts[1])'." 4 }
}
Write-Host "Bundle provenance: checksums verified" -ForegroundColor Green

if (-not $SiteId) {
  $candidate = ([string]$sitePackage.name).ToLowerInvariant() -replace '[^a-z0-9-]', '-'
  $candidate = $candidate.Trim('-')
  if ($candidate.Length -lt 2) { $candidate = "site-project" }
  if ($NonInteractive) { $SiteId = $candidate }
  else {
    $entered = Read-Host "Site ID [$candidate]"
    $SiteId = if ([string]::IsNullOrWhiteSpace($entered)) { $candidate } else { $entered.Trim() }
  }
}
if ($SiteId -notmatch '^[a-z0-9][a-z0-9-]{1,62}$') {
  Stop-Setup "Site ID must be 2-63 lowercase letters, numbers, or hyphens." 5
}

if (-not $KalpServiceUrl) { $KalpServiceUrl = [Environment]::GetEnvironmentVariable('KALP_SERVICE_URL') }
if (-not $KalpServiceUrl) {
  $KalpServiceUrl = Read-EnvValue (Join-Path $resolvedRoot '.env.local') @('KALP_SERVICE_URL', 'FASTAPI_URL', 'NEXT_PUBLIC_API_BASE_URL')
}
if (-not $KalpServiceUrl -and $ApiProfile -eq 'Local') {
  $KalpServiceUrl = 'http://127.0.0.1:8000'
}
if (-not $KalpServiceUrl -and -not $NonInteractive) {
  $KalpServiceUrl = (Read-Host "Kalp $ApiProfile API URL (leave blank to configure later)").Trim()
}
if (-not $KalpServiceUrl -and $ApiProfile -eq 'Live') {
  Stop-Setup "Live API profile requires an explicit Kalp service URL. No credential is requested or stored." 5
}
if ($KalpServiceUrl -and $KalpServiceUrl -notmatch '^https?://') {
  Stop-Setup "Kalp service URL must begin with http:// or https://." 5
}
$KalpServiceUrl = ([string]$KalpServiceUrl).TrimEnd('/')

$targetPackage = Join-Path $resolvedRoot "packages\kalp-site-studio-toolkit"
if (Test-Path -LiteralPath $targetPackage) {
  $same = (Get-TreeHash $bundleRoot) -eq (Get-TreeHash $targetPackage)
  if (-not $same -and -not $Force) {
    Stop-Setup "A different Site Studio package already exists. Re-run with -Force only after reviewing local changes." 6
  }
}

if (Test-Path -LiteralPath $targetPackage) {
  if (-not ((Get-TreeHash $bundleRoot) -eq (Get-TreeHash $targetPackage))) {
    Remove-Item -LiteralPath $targetPackage -Recurse -Force
  }
}
if (-not (Test-Path -LiteralPath $targetPackage)) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $targetPackage) | Out-Null
  Copy-Item -LiteralPath $bundleRoot -Destination $targetPackage -Recurse
}

$configDir = Join-Path $resolvedRoot ".kalp"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$manifestPath = Join-Path $configDir "site-studio.json"
if (-not (Test-Path -LiteralPath $manifestPath)) {
  $manifest = [ordered]@{
    schemaVersion = "kalp.site-studio.v1"
    siteId = $SiteId
    capabilities = [ordered]@{
      content = [ordered]@{ enabled = $true; mode = "draft" }
      media = [ordered]@{ enabled = $false }
      catalog = [ordered]@{ enabled = $false }
      pricing = [ordered]@{ enabled = $false }
    }
    fields = [ordered]@{}
  }
  $manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
}

$setupConfigPath = Join-Path $configDir "site-studio.setup.json"
$setupConfig = [ordered]@{
  schemaVersion = "kalp.site-studio.setup.v1"
  siteId = $SiteId
  serviceUrlConfigured = [bool]$KalpServiceUrl
  apiProfile = $ApiProfile
  serviceUrl = if ($KalpServiceUrl) { $KalpServiceUrl } else { $null }
}
$setupConfig | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $setupConfigPath -Encoding UTF8

Push-Location $resolvedRoot
try {
  if (-not $SkipInstall) {
    Write-Host "Dependency setup: $manager $($installArgs -join ' ')" -ForegroundColor Cyan
    & $manager @installArgs
    if ($LASTEXITCODE -ne 0) { Stop-Setup "Dependency setup failed with exit code $LASTEXITCODE." 8 }
  } else {
    Write-Host "Dependency setup skipped by explicit -SkipInstall." -ForegroundColor Yellow
  }

  if ($Mode -eq 'Build') {
    if (-not $sitePackage.scripts.build) {
      Stop-Setup "Build mode was requested, but package.json has no build script." 9
    }
    Write-Host "Build verification: $manager run build" -ForegroundColor Cyan
    & $manager run build
    if ($LASTEXITCODE -ne 0) { Stop-Setup "The site's build failed with exit code $LASTEXITCODE. Production readiness was not established." 9 }
    Write-Host "Build verification: Passed" -ForegroundColor Green
  }
} finally {
  Pop-Location
}

$healthReady = $false
$healthEndpoint = $null
if ($KalpServiceUrl) {
  foreach ($candidate in @('/health/live', '/health')) {
    try {
      $health = Invoke-WebRequest -Uri "$KalpServiceUrl$candidate" -Method Get -TimeoutSec 10 -UseBasicParsing
      if ($health.StatusCode -ge 200 -and $health.StatusCode -lt 300) {
        $healthReady = $true
        $healthEndpoint = $candidate
        break
      }
    } catch { }
  }
  if (-not $healthReady) {
    Write-Host "Health check failed: the configured Kalp service did not return Ready." -ForegroundColor Yellow
  }
} else {
  Write-Host "Health check skipped: no Kalp service URL is configured." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Project root: $resolvedRoot"
Write-Host "Site Studio package: Ready" -ForegroundColor Green
Write-Host "Site manifest: $manifestPath"
Write-Host "Kalp service: $(if ($healthReady) { 'Ready' } elseif ($KalpServiceUrl) { 'Not ready' } else { 'Setup needed' })"
Write-Host "Kalp service URL: $(if ($KalpServiceUrl) { $KalpServiceUrl } else { 'not configured' })"
if ($healthEndpoint) { Write-Host "Kalp health endpoint: $healthEndpoint" }
Write-Host "API profile: $ApiProfile"
Write-Host "Secrets: not requested, copied, or printed"
if ($healthReady) { Write-Host "RESULT: TOOLKIT AND KALP SERVICE READY" -ForegroundColor Green }
else { Write-Host "RESULT: LOCAL SETUP READY - KALP SERVICE CHECK NEEDED" -ForegroundColor Yellow }

if ($Mode -eq 'Configure') {
  Write-Host "Next command: .\SiteLauncher.ps1 -Mode Start -ApiProfile $ApiProfile"
  Write-Host "Re-run Setup at any time; matching files and configuration are preserved."
  if ($healthReady) { exit 0 } else { exit 10 }
}

$startScript = if ($Mode -eq 'Build' -and $sitePackage.scripts.start) { 'start' } elseif ($sitePackage.scripts.dev) { 'dev' } elseif ($sitePackage.scripts.start) { 'start' } else { $null }
if (-not $startScript) { Stop-Setup "No dev or start script is available in package.json." 9 }
$localUrl = "http://localhost:$Port"
Write-Host ""
Write-Host "Starting site in this terminal: $manager run $startScript -- --port $Port" -ForegroundColor Cyan
Write-Host "Local URL: $localUrl"
Write-Host "Stop: press Ctrl+C"
Write-Host "Re-run: .\SiteLauncher.ps1 -Mode $Mode -ApiProfile $ApiProfile -Port $Port"
Write-Host "The site command below will print its own Ready state and runtime logs." -ForegroundColor Cyan
Push-Location $resolvedRoot
try {
  & $manager run $startScript -- --port $Port
  $siteExit = $LASTEXITCODE
} finally {
  Pop-Location
}
exit $siteExit
