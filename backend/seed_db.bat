@echo off
echo ========================================
echo   SEED DATABASE - Update MongoDB Data
echo ========================================
echo.

cd /d "%~dp0"

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run seed script
python seed_database.py

echo.
echo ========================================
echo   DONE! Press any key to exit...
echo ========================================
pause >nul
