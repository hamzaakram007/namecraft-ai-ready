#!/bin/bash
# NameCraft AI Quick Start Script

echo "🚀 NameCraft AI Backend Setup"
echo "================================"

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

# Create database if it doesn't exist
if [ ! -f "database.db" ]; then
    echo "💾 Database will be created on first run"
fi

# Start server
echo ""
echo "✅ Starting NameCraft AI Backend..."
echo "🔗 Backend running on: http://localhost:5000"
echo "📱 Open frontend at: namecraft-ai-frontend.html"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

npm start
