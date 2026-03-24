@echo off
chcp 65001 >nul
echo Starting EAM Enterprise Asset Management...
echo =========================================

if not exist logs mkdir logs

echo.
echo [1/2] Starting backend service (Port 9000) in background...
powershell -Command "Start-Process powershell -ArgumentList '-Command \"cd eam-server; mvn spring-boot:run 2>&1 ^| Out-File -Encoding utf8 -Append -FilePath ..\logs\backend.log\"' -WindowStyle Hidden"

echo.
echo [2/2] Starting frontend service (Port 3000) in background...
powershell -Command "Start-Process powershell -ArgumentList '-Command \"cd eam-ui; npm run dev 2>&1 ^| Out-File -Encoding utf8 -Append -FilePath ..\logs\frontend.log\"' -WindowStyle Hidden"

echo.
echo =========================================
echo Commands sent!
echo Services are running in the background.
echo Check logs/ directory for outputs.
echo =========================================
pause
