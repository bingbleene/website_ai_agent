@echo off
REM ========================================
REM  Start Backend Server
REM ========================================

echo ========================================
echo   Starting Backend Server...
echo ========================================
echo.

cd backend

REM Activate virtual environment
call venv\Scripts\activate

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Start backend
echo Starting FastAPI server...
echo Backend will run at: http://localhost:8000
echo API Docs at: http://localhost:8000/api/docs
echo.
echo Press Ctrl+C to stop
echo.

python main.py
