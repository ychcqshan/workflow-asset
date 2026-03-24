cmd /c "chcp 65001 && echo 中国 > e:\project\workflow-asset\test_out.txt"
$bytes = [System.IO.File]::ReadAllBytes("e:\project\workflow-asset\test_out.txt")
Write-Output ("Bytes: " + ($bytes -join ","))
