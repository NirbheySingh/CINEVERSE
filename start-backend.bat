@echo off
cd /d "%~dp0backend"
echo Starting CineVerse Backend on port 5005...
node server.js
pause
