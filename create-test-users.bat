@echo off
echo ========================================
echo    Creating Test Users for Vivento
echo ========================================
echo.

cd backend
node scripts/create-test-users.js

echo.
echo ========================================
echo    Test Users Creation Complete!
echo ========================================
echo.
echo You can now test the app with:
echo Student: student@test.com / password123
echo Organizer: organizer@test.com / password123
echo.
pause