@echo off
chcp 65001 >nul
echo 正在停止 EAM 企业资产管理系统...
echo =========================================

echo.
echo 查找并关闭占用 9000 端口的后端服务...
powershell -Command "Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { echo \"发现进程 PID: $($_.OwningProcess)，正在终止...\"; Stop-Process -Id $_.OwningProcess -Force } }"

echo.
echo 查找并关闭占用 3000 端口的前端服务...
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { echo \"发现进程 PID: $($_.OwningProcess)，正在终止...\"; Stop-Process -Id $_.OwningProcess -Force } }"

echo.
echo =========================================
echo 系统服务已收到终止指令。
echo =========================================
pause

