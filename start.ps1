# start.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting EAM Enterprise Asset Management..." -ForegroundColor Cyan
Write-Host "========================================="

$LogsDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

$BackendLog = Join-Path $LogsDir "backend.log"
$FrontendLog = Join-Path $LogsDir "frontend.log"

Write-Host ""
Write-Host "[1/2] Starting backend service (Port 9000) in background..." -ForegroundColor Green
$BackendCmd = "cd `"$PSScriptRoot\eam-server`"; mvn spring-boot:run 2>&1 | Out-File -Encoding utf8 -Append -FilePath `"$BackendLog`""
Start-Process powershell -ArgumentList "-Command", $BackendCmd -WindowStyle Hidden

Write-Host "[2/2] Starting frontend service (Port 3000) in background..." -ForegroundColor Green
$FrontendCmd = "cd `"$PSScriptRoot\eam-ui`"; npm run dev 2>&1 | Out-File -Encoding utf8 -Append -FilePath `"$FrontendLog`""
Start-Process powershell -ArgumentList "-Command", $FrontendCmd -WindowStyle Hidden

Write-Host ""
Write-Host "========================================="
Write-Host "Services triggered in the background!" -ForegroundColor Yellow
Write-Host "Logs are being written to logs/ directory."
Write-Host "To view logs:         cat logs\backend.log"
Write-Host "To stop services:     .\stop.ps1"
Write-Host "========================================="
