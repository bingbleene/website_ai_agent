@echo off
REM ========================================
REM  Start Frontend Server
REM ========================================

echo ========================================
echo   Starting Frontend Server...
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Start frontend
echo Starting Vite dev server...
echo Frontend will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

call npm run dev
