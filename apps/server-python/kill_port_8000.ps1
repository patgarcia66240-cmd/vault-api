Get-NetTCPConnection -LocalPort 8000 -State Listen | ForEach-Object {
    $procId = $_.OwningProcess
    Write-Host "Killing PID: $procId"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
Write-Host "Done"
