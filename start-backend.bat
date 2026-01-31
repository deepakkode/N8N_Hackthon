@echo off
echo ========================================
echo   Starting College Events Backend
echo ========================================
echo.
echo Checking if MySQL is running...
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo WARNING: MySQL service might not be running!
    echo Please start MySQL service from Windows Services
    echo.
    pause
)

echo Navigating to backend directory...
cd backend

echo Installing dependencies...
npm install

echo.
echo Starting backend server...
echo Backend will run on http://localhost:5007
echo.
echo ========================================
echo   Backend Server Starting...
echo ========================================
npm start

pause