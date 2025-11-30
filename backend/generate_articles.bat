@echo off
REM Batch script để sinh nhiều bài viết với Mistral và xuất HTML

echo ========================================
echo SINH BAI VIET HANG LOAT VOI MISTRAL
echo ========================================
echo.

cd /d "%~dp0"

python generate_articles_batch.py

echo.
echo Nhan phim bat ky de dong...
pause > nul
