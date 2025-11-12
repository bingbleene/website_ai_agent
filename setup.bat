@echo off
REM ========================================
REM  AI News System - Quick Start Script
REM  For Windows
REM ========================================

echo ========================================
echo   AI News Management System
echo   Quick Start Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js are installed
echo.

REM Setup Backend
echo ========================================
echo   Setting up Backend...
echo ========================================
cd backend

REM Check if venv exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Copying .env.example to .env...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit backend\.env and fill in your API keys:
    echo   - MONGODB_URI
    echo   - OPENAI_API_KEY
    echo   - SECRET_KEY
    echo   - JWT_SECRET_KEY
    echo.
    pause
)

cd ..

REM Setup Frontend
echo ========================================
echo   Setting up Frontend...
echo ========================================
cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
)

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Make sure MongoDB Atlas is configured (see SETUP_LOCAL.md)
echo   2. Make sure RabbitMQ is running
echo   3. Fill in .env files with your API keys
echo.
echo To start the application:
echo   - Run: start_backend.bat  (in Terminal 1)
echo   - Run: start_frontend.bat (in Terminal 2)
echo.
pause
