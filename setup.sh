#!/bin/bash
# ========================================
#  AI News System - Quick Start Script
#  For macOS/Linux
# ========================================

set -e  # Exit on error

echo "========================================"
echo "  AI News Management System"
echo "  Quick Start Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed!"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Python and Node.js are installed"
echo ""

# Setup Backend
echo "========================================"
echo "  Setting up Backend..."
echo "========================================"
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "[ACTION REQUIRED] Please edit backend/.env and fill in your API keys:"
    echo "  - MONGODB_URI"
    echo "  - OPENAI_API_KEY"
    echo "  - SECRET_KEY"
    echo "  - JWT_SECRET_KEY"
    echo ""
    read -p "Press Enter to continue..."
fi

cd ..

# Setup Frontend
echo "========================================"
echo "  Setting up Frontend..."
echo "========================================"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

cd ..

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Make sure MongoDB Atlas is configured (see SETUP_LOCAL.md)"
echo "  2. Make sure RabbitMQ is running"
echo "  3. Fill in .env files with your API keys"
echo ""
echo "To start the application:"
echo "  - Run: ./start_backend.sh  (in Terminal 1)"
echo "  - Run: ./start_frontend.sh (in Terminal 2)"
echo ""
