# stop.ps1 — EAM 一键停止（端口精确匹配 + 进程树清理）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Stopping EAM Services" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Stop-ServiceByPort {
    param([int]$Port, [string]$Label)

    Write-Host ""
    Write-Host "[$Label] Checking port $Port..." -ForegroundColor White

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $connections) {
        Write-Host "  No process on port $Port." -ForegroundColor DarkGray
        return
    }

    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -eq 0) { continue }
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Killing $($proc.ProcessName) (PID: $pid)..." -ForegroundColor Yellow
            # 使用 taskkill /T 杀进程树，解决 Java/Node 子进程残留
            & taskkill /F /T /PID $pid 2>$null | Out-Null
            Write-Host "  Stopped." -ForegroundColor Green
        }
    }
}

Stop-ServiceByPort -Port 9000 -Label "Backend"
Stop-ServiceByPort -Port 3000 -Label "Frontend"

# 检查是否有残留的 java/node 进程（由本项目的隐藏窗口启动）
Write-Host ""
$javaProcs = Get-Process java -ErrorAction SilentlyContinue
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue

if ($javaProcs -or $nodeProcs) {
    Write-Host "Orphan processes detected:" -ForegroundColor Yellow
    if ($javaProcs) {
        $javaProcs | ForEach-Object { Write-Host "  java PID: $($_.Id) | CPU: $([math]::Round($_.CPU, 1))s" -ForegroundColor DarkYellow }
    }
    if ($nodeProcs) {
        $nodeProcs | ForEach-Object { Write-Host "  node PID: $($_.Id) | CPU: $([math]::Round($_.CPU, 1))s" -ForegroundColor DarkYellow }
    }
    Write-Host ""
    Write-Host "To kill all orphans:" -ForegroundColor DarkGray
    Write-Host "  Get-Process java | Stop-Process -Force" -ForegroundColor DarkGray
    Write-Host "  Get-Process node | Stop-Process -Force" -ForegroundColor DarkGray
} else {
    Write-Host "No orphan java/node processes." -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  EAM services stopped." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
