#!/bin/bash
# ========================================
#  Start Frontend Server
# ========================================

echo "========================================"
echo "  Starting Frontend Server..."
echo "========================================"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[ERROR] node_modules not found!"
    echo "Please run setup.sh first"
    exit 1
fi

# Start frontend
echo "Starting Vite dev server..."
echo "Frontend will run at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
