# stop.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Stopping EAM Services..." -ForegroundColor Cyan
Write-Host "========================================="

function Stop-ByPort($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $pidToKill = $conn.OwningProcess
        $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "Stopping process $($proc.ProcessName) (PID: $pidToKill) on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            Write-Host "Process on port $port stopped." -ForegroundColor Green
        }
    } else {
        Write-Host "No process found on port $port." -ForegroundColor Gray
    }
}

Write-Host "[1/2] Checking Backend (9000)..."
Stop-ByPort 9000

Write-Host "[2/2] Checking Frontend (3000)..."
Stop-ByPort 3000

Write-Host ""
Write-Host "If you experience zombie Node/Java processes, you can run:" -ForegroundColor Gray
Write-Host "Get-Process node | Stop-Process -Force" -ForegroundColor DarkGray
Write-Host "Get-Process java | Stop-Process -Force" -ForegroundColor DarkGray
Write-Host "========================================="
