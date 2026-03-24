@echo off
chcp 65001 >nul
echo 正在启动 EAM 企业资产管理系统...
echo =========================================

echo.
echo [1/2] 正在启动后端服务 (端口 9000)...
cd eam-server
start cmd /k "title EAM-Server(9000) && mvn spring-boot:run"
cd ..

echo.
echo [2/2] 正在启动前端应用 (端口 3000)...
cd eam-ui
start cmd /k "title EAM-UI(3000) && npm run dev"
cd ..

echo.
echo =========================================
echo 服务启动指令已发送！
echo 请等待后端(SpringBoot)和前端(Vite)的终端窗口出现 "Started xxx" 或 "Ready" 字样。
echo 之后即可在浏览器访问: http://localhost:3000
echo =========================================
pause
