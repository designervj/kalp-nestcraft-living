[CmdletBinding()]
param([string]$SiteRoot = (Get-Location).Path, [string]$JsonReport)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($SiteRoot)
$checks = [ordered]@{}
$checks.projectRoot = $root
$checks.packageJson = Test-Path -LiteralPath (Join-Path $root 'package.json') -PathType Leaf
$checks.siteStudioPackage = Test-Path -LiteralPath (Join-Path $root 'packages\kalp-site-studio-toolkit\package.json') -PathType Leaf
$checks.siteManifest = Test-Path -LiteralPath (Join-Path $root '.kalp\site-studio.json') -PathType Leaf
$checks.packageManager = if (Test-Path (Join-Path $root 'pnpm-lock.yaml')) { 'pnpm' } elseif (Test-Path (Join-Path $root 'yarn.lock')) { 'yarn' } elseif ((Test-Path (Join-Path $root 'bun.lock')) -or (Test-Path (Join-Path $root 'bun.lockb'))) { 'bun' } else { 'npm' }
$checks.packageManagerAvailable = [bool](Get-Command $checks.packageManager -ErrorAction SilentlyContinue)
$serviceUrl = [Environment]::GetEnvironmentVariable('KALP_SERVICE_URL')
$savedSetup = Join-Path $root '.kalp\site-studio.setup.json'
if (-not $serviceUrl -and (Test-Path -LiteralPath $savedSetup -PathType Leaf)) {
  try { $serviceUrl = (Get-Content -LiteralPath $savedSetup -Raw | ConvertFrom-Json).serviceUrl } catch { $serviceUrl = $null }
}
$checks.serviceUrlConfigured = [bool]$serviceUrl
$checks.serviceReady = $false
$checks.healthEndpoint = $null
if ($serviceUrl -and $serviceUrl -match '^https?://') {
  foreach ($candidate in @('/health/live', '/health')) {
    try {
      $response = Invoke-WebRequest -Uri "$($serviceUrl.TrimEnd('/'))$candidate" -TimeoutSec 10 -UseBasicParsing
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        $checks.serviceReady = $true
        $checks.healthEndpoint = $candidate
        break
      }
    } catch { }
  }
}
$checks.ready = $checks.packageJson -and $checks.siteStudioPackage -and $checks.siteManifest -and $checks.packageManagerAvailable -and $checks.serviceReady
$report = [ordered]@{ schemaVersion = 'kalp.site-studio.doctor.v1'; checkedAt = [DateTime]::UtcNow.ToString('o'); checks = $checks }
Write-Host 'Site Studio Doctor' -ForegroundColor Cyan
Write-Host "Project: $root"
foreach ($item in $checks.GetEnumerator()) { Write-Host "$($item.Key): $($item.Value)" }
Write-Host "RESULT: $(if ($checks.ready) { 'READY' } else { 'ATTENTION NEEDED' })" -ForegroundColor $(if ($checks.ready) { 'Green' } else { 'Yellow' })
if ($JsonReport) {
  $report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath ([IO.Path]::GetFullPath($JsonReport)) -Encoding UTF8
  Write-Host "JSON report: $([IO.Path]::GetFullPath($JsonReport))"
}
if ($checks.ready) { exit 0 } else { exit 10 }
