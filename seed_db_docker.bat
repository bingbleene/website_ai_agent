@echo off
echo ========================================
echo   SEED DATABASE - Docker Version
echo ========================================
echo.

docker exec -it ai_news_backend python seed_database.py

echo.
echo Press any key to exit...
pause >nul
