@echo off
chcp 65001 > nul
mvn clean compile 2>&1 | findstr /I "error ERROR 错误 找不到 cannot" > compile_errors_raw.txt
echo Done
