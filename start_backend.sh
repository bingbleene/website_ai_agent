#!/bin/bash
# ========================================
#  Start Backend Server
# ========================================

echo "========================================"
echo "  Starting Backend Server..."
echo "========================================"
echo ""

cd backend

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[ERROR] .env file not found!"
    echo "Please run setup.sh first"
    exit 1
fi

# Start backend
echo "Starting FastAPI server..."
echo "Backend will run at: http://localhost:8000"
echo "API Docs at: http://localhost:8000/api/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python main.py
