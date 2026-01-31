@echo off
echo ========================================
echo   Starting College Events Frontend
echo ========================================
echo.
echo IMPORTANT: Make sure backend is running first!
echo Backend should show "Server running on port 5007"
echo.
echo Installing dependencies...
npm install

echo.
echo Starting frontend...
echo Frontend will run on http://localhost:3000
echo.
echo ========================================
echo   Frontend Starting...
echo ========================================
npm start

pause