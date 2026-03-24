@echo off
if not exist logs mkdir logs
powershell -Command "Start-Process powershell -ArgumentList '-Command \"echo 中文测试; cd eam-server; mvn spring-boot:run\"' -RedirectStandardOutput 'logs\test_backend_redirect.log' -RedirectStandardError 'logs\test_backend_redirect.log' -WindowStyle Hidden"
echo Started. Check logs\test_backend_redirect.log in a few.
pause
