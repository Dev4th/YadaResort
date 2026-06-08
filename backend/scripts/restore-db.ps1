param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
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

$resolvedBackup = Resolve-Path $BackupPath
$databaseUrl = Read-DatabaseUrl

if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) {
  throw "pg_restore was not found. Install PostgreSQL client tools and add them to PATH."
}

Write-Host "Restoring database from: $resolvedBackup"
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$databaseUrl" "$resolvedBackup"

Write-Host "Database restore completed."
