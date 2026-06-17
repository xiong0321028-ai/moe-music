@echo off
cd /d "%~dp0"
title MoeMusic Server + Tunnel

echo ============================
echo  Starting MoeMusic Server
echo ============================
echo.

taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [1/2] Starting API server...
start /B "" node start.js
timeout /t 4 /nobreak >nul

echo [2/2] Starting public tunnel...
echo.
echo Waiting for tunnel URL...
echo.

npx localtunnel --port 3000

echo.
echo Server stopped.
pause
