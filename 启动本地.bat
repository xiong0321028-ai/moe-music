@echo off
cd /d "%~dp0"
title MoeMusic Local

echo ============================
echo  Starting MoeMusic Server
echo ============================
echo.
echo Open in browser:
echo http://localhost:3000/music-player.html
echo.

taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [1/2] Starting API server...
start /B "" node start.js
timeout /t 4 /nobreak >nul

echo [2/2] Ready!
echo.
echo Server running at http://localhost:3000
echo Close this window to stop.
echo.
pause >nul
