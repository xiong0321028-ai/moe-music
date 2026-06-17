@echo off
cd /d "%~dp0"

echo ============================
echo  Deploy to GitHub in 3 steps
echo ============================
echo.
echo Step 1: Replace YOUR_USER with your GitHub username
echo Step 2: Run these commands:
echo.
echo   git remote add origin https://github.com/YOUR_USER/moe-music.git
echo   git push -u origin master
echo.
echo Step 3: Go to https://dashboard.render.com
echo         Click New + ^> Blueprint
echo         Connect the moe-music repo
echo         Set MUSIC_U env var
echo.
echo Done!
pause
