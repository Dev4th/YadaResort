param(
  [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"

function Read-DatabaseUrl {
  if ($env:DATABASE_URL) {
    return $env:DATABASE_URL
  }

  $envPath = Join-Path $PSScriptRoot "..\.env"
  if (-not (Test-Path $envPath)) {
    throw "DATABASE_URL is not set and backend\.env was not found."
  }

  $line = Get-Content $envPath | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
  if (-not $line) {
    throw "DATABASE_URL was not found in backend\.env."
  }

  return ($line -replace "^DATABASE_URL=", "").Trim('"')
}

$databaseUrl = Read-DatabaseUrl
$targetDir = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path $OutputDir
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $targetDir "yadaresort-$timestamp.dump"

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump was not found. Install PostgreSQL client tools and add them to PATH."
}

pg_dump --format=custom --no-owner --no-privileges --file="$backupPath" "$databaseUrl"

Write-Host "Database backup created: $backupPath"
