@echo off
echo DharmaSikhara Local Backend Setup
echo ================================

echo Installing dependencies...
cd backend
npm install

echo.
echo Initializing SQLite database...
npm run init-db

echo.
echo Starting backend server...
npm run dev

echo.
echo Backend server is now running locally with SQLite database.
echo Press Ctrl+C to stop the server.
pause