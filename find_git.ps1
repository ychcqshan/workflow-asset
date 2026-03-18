$paths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "D:\Program Files\Git\cmd\git.exe",
    "E:\Program Files\Git\cmd\git.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Git\cmd\git.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Git\bin\git.exe"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Output "FOUND: $p"
        exit 0
    }
}
Write-Output "NOT_FOUND_AT_ALL"
exit 1
