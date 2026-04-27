$WshShell = New-Object -ComObject WScript.Shell
$appDir = "C:\Users\Silva\WorkSpace\windows assistant"
$scriptPath = "$appDir\launch-jan-extended.ps1"
$desktopPath = [System.Environment]::GetFolderPath("Desktop")

if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: Launch script not found at $scriptPath" -ForegroundColor Red
    exit
}

$Shortcut = $WshShell.CreateShortcut("$desktopPath\Jan-Extended.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`""
$Shortcut.WorkingDirectory = $appDir
$Shortcut.Description = "Launch Jan-Extended AI OS"
$Shortcut.IconLocation = "imageres.dll, 203" # Modern-looking icon
$Shortcut.Save()

Write-Host "------------------------------------" -ForegroundColor Green
Write-Host "   SHORTCUT CREATED SUCCESSFULLY!   " -ForegroundColor Green
Write-Host "   Look for 'Jan-Extended' on your Desktop." -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Green
