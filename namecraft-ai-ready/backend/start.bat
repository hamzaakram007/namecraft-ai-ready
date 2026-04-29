@echo off
REM NameCraft AI Quick Start Script for Windows

echo.
echo 🚀 NameCraft AI Backend Setup
echo ================================
echo.

REM Navigate to backend
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

REM Create database if it doesn't exist
if not exist "database.db" (
    echo 💾 Database will be created on first run
)

REM Start server
echo.
echo ✅ Starting NameCraft AI Backend...
echo 🔗 Backend running on: http://localhost:5000
echo 📱 Open frontend at: namecraft-ai-frontend.html
echo.
echo Press Ctrl+C to stop server
echo.

call npm start
pause
