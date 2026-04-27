$appDir = "C:\Users\Silva\WorkSpace\windows assistant\jan-extended\ui\minimax"

Write-Host "------------------------------------" -ForegroundColor Cyan
Write-Host "   JAN-EXTENDED AI OS LAUNCHER      " -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor Cyan

# Ensure Python user scripts are on PATH (required for llama-cpp-python)
$env:PATH = "C:\Users\Silva\AppData\Roaming\Python\Python314\Scripts;" + $env:PATH

# Kill existing processes to avoid conflicts
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Stop-Process -Name "electron" -ErrorAction SilentlyContinue
Stop-Process -Name "python" -ErrorAction SilentlyContinue

# Launch App
Write-Host "Launching Jan-Extended AI OS..." -ForegroundColor Green
Set-Location -Path $appDir
npm run electron

Write-Host "`nReady!" -ForegroundColor Green
