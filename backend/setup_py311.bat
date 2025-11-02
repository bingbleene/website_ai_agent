@echo off
chcp 65001 >nul
cls
echo ========================================
echo Setup Backend with Python 3.11 Portable
echo ========================================
echo.
echo Python 3.13 của bạn vẫn giữ nguyên!
echo Script này chỉ setup Python 3.11 trong folder này.
echo.

set PYTHON311_DIR=%~dp0python311
set PYTHON311_EXE=%PYTHON311_DIR%\python.exe

if exist "%PYTHON311_EXE%" (
    echo [✓] Python 3.11 đã tồn tại
    goto create_venv
)

echo [1/4] Downloading Python 3.11.9...
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip' -OutFile 'python311.zip'"
if errorlevel 1 goto error_download
echo [✓] Downloaded

echo.
echo [2/4] Extracting...
powershell -Command "Expand-Archive -Path 'python311.zip' -DestinationPath '%PYTHON311_DIR%' -Force"
del python311.zip
echo [✓] Extracted

echo.
echo [3/4] Installing pip...
(
    echo import site
    echo.
    echo python311.zip
    echo .
    echo Lib\site-packages
) > "%PYTHON311_DIR%\python311._pth"

powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '%PYTHON311_DIR%\get-pip.py'"
"%PYTHON311_EXE%" "%PYTHON311_DIR%\get-pip.py" --no-warn-script-location >nul 2>&1
del "%PYTHON311_DIR%\get-pip.py"
"%PYTHON311_EXE%" -m pip install virtualenv --no-warn-script-location --quiet
echo [✓] pip + virtualenv installed

:create_venv
echo.
echo [4/4] Creating venv...
if exist venv rmdir /s /q venv
"%PYTHON311_EXE%" -m virtualenv venv >nul 2>&1
if errorlevel 1 goto error_venv
echo [✓] venv created

echo.
echo [5/5] Installing packages (2-3 minutes)...
call venv\Scripts\activate.bat
pip install --upgrade pip --quiet
pip install -r requirements.txt
if errorlevel 1 goto error_install

echo.
echo ========================================
echo [✓✓✓] SETUP COMPLETE!
echo ========================================
echo.
echo To start: venv\Scripts\activate
echo           python -m uvicorn main:app --reload
echo.
pause
exit /b 0

:error_download
echo [X] Download failed - Check internet
pause
exit /b 1

:error_venv
echo [X] Cannot create venv
pause
exit /b 1

:error_install
echo [X] Install failed - Run again or check log
pause
exit /b 1
