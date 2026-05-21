@echo off
cd /d "%~dp0frontend"
echo Starting CineVerse Frontend on http://localhost:5173 ...
call npm.cmd run dev
pause
