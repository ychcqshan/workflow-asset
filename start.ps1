# start.ps1 — EAM 一键启动（后台静默 + 日志 + 健康检查）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$LogsDir = Join-Path $Root "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null }

$BackendLog  = Join-Path $LogsDir "backend.log"
$FrontendLog = Join-Path $LogsDir "frontend.log"

# 清空旧日志
"" | Set-Content $BackendLog
"" | Set-Content $FrontendLog

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  EAM Enterprise Asset Management" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# ---- 1. Docker MySQL ----
Write-Host ""
Write-Host "[0/2] Checking MySQL Docker..." -ForegroundColor DarkGray
$mysqlRunning = docker ps --filter "name=terminal-monitor-mysql" --format "{{.Status}}" 2>$null
if (-not $mysqlRunning) {
    Write-Host "  Starting MySQL container..." -ForegroundColor Yellow
    docker start terminal-monitor-mysql 2>$null | Out-Null
    Start-Sleep -Seconds 2
    $mysqlRunning = docker ps --filter "name=terminal-monitor-mysql" --format "{{.Status}}" 2>$null
    if ($mysqlRunning) {
        Write-Host "  MySQL started." -ForegroundColor Green
    } else {
        Write-Host "  WARNING: MySQL container not found. Backend may fail to connect." -ForegroundColor Red
    }
} else {
    Write-Host "  MySQL already running." -ForegroundColor Green
}

# ---- 2. 后端 ----
Write-Host ""
Write-Host "[1/2] Starting Backend (port 9000)..." -ForegroundColor Green

# 检查端口是否已占用
$existing = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    Write-Host "  Port 9000 already in use (PID: $($existing.OwningProcess)). Skipping." -ForegroundColor Yellow
} else {
    $backendScript = @"
Set-Location '$Root\eam-server'
& mvn spring-boot:run 2>&1 | Out-File -Encoding utf8 -FilePath '$BackendLog'
"@
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", $backendScript -WindowStyle Hidden
    Write-Host "  Backend starting in background. Log: logs\backend.log" -ForegroundColor DarkGray
}

# ---- 3. 前端 ----
Write-Host ""
Write-Host "[2/2] Starting Frontend (port 3000)..." -ForegroundColor Green

$existing = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    Write-Host "  Port 3000 already in use (PID: $($existing.OwningProcess)). Skipping." -ForegroundColor Yellow
} else {
    $frontendScript = @"
Set-Location '$Root\eam-ui'
& npm run dev 2>&1 | Out-File -Encoding utf8 -FilePath '$FrontendLog'
"@
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", $frontendScript -WindowStyle Hidden
    Write-Host "  Frontend starting in background. Log: logs\frontend.log" -ForegroundColor DarkGray
}

# ---- 4. 健康检查 ----
Write-Host ""
Write-Host "Waiting for services..." -ForegroundColor DarkGray

$maxWait = 60
$waited = 0
$backendReady = $false
$frontendReady = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 3
    $waited += 3

    if (-not $backendReady) {
        $conn = Get-NetTCPConnection -LocalPort 9000 -State Listen -ErrorAction SilentlyContinue
        if ($conn) { $backendReady = $true; Write-Host "  [OK] Backend is listening on :9000" -ForegroundColor Green }
    }
    if (-not $frontendReady) {
        $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
        if ($conn) { $frontendReady = $true; Write-Host "  [OK] Frontend is listening on :3000" -ForegroundColor Green }
    }

    if ($backendReady -and $frontendReady) { break }

    # 每 15 秒输出等待进度
    if ($waited % 15 -eq 0) {
        $pending = @()
        if (-not $backendReady)  { $pending += "Backend" }
        if (-not $frontendReady) { $pending += "Frontend" }
        Write-Host "  Still waiting for: $($pending -join ', ') ($waited s)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
if ($backendReady -and $frontendReady) {
    Write-Host "  All services are UP!" -ForegroundColor Green
} else {
    if (-not $backendReady)  { Write-Host "  [WARN] Backend did not start in ${maxWait}s. Check logs\backend.log" -ForegroundColor Red }
    if (-not $frontendReady) { Write-Host "  [WARN] Frontend did not start in ${maxWait}s. Check logs\frontend.log" -ForegroundColor Red }
}
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:9000" -ForegroundColor White
Write-Host "  Stop:     .\stop.ps1" -ForegroundColor DarkGray
Write-Host "=========================================" -ForegroundColor Cyan
