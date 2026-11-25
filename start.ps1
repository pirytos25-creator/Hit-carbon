$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot
Write-Host "BIOGENESIS: THE HIIT EXPERIENCE — Uruchamianie..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalowanie pakietów npm..." -ForegroundColor Yellow
    & npm.cmd install
}
Start-Process "http://127.0.0.1:5173"
& npm.cmd run dev
