@echo off
cd /d "%~dp0"
echo Starting Backend and Frontend in separate windows...
start "CineVerse Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 2 /nobreak >nul
start "CineVerse Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"
echo.
echo Backend:  http://localhost:5005
echo Frontend: http://localhost:5173
echo.
echo Close the two CMD windows to stop the servers.
