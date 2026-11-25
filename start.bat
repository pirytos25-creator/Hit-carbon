@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   BIOGENESIS: THE HIIT EXPERIENCE
echo   Lokalne uruchomienie aplikacji
echo ============================================================
if not exist "node_modules" (
  echo [1/2] Instalacja zaleznosci npm...
  call npm.cmd install
)
echo [2/2] Uruchamianie serwera Vite pod adresem http://127.0.0.1:5173 ...
start "" http://127.0.0.1:5173
call npm.cmd run dev
