@echo off
chcp 65001 >nul
echo 正在停止 EAM 企业资产管理系统...
echo =========================================

echo.
echo 查找并关闭占用 9000 端口的后端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9000 ^| findstr LISTENING') do (
    echo 发现进程 PID: %%a，正在终止...
    taskkill /F /PID %%a
)

echo.
echo 查找并关闭占用 3000 端口的前端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 发现进程 PID: %%a，正在终止...
    taskkill /F /PID %%a
)

echo.
echo =========================================
echo 系统服务已关闭。
echo =========================================
pause
