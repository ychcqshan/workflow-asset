@echo off
if not exist logs mkdir logs
powershell -Command "Start-Process cmd -ArgumentList '/c chcp 65001 && echo 中文测试从cmd重定向 && cd eam-server && mvn spring-boot:run > ..\logs\test_cmd.log 2>&1' -WindowStyle Hidden"
echo Started. Check logs\test_cmd.log in a few.
pause
