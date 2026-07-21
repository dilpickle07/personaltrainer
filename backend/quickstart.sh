#!/bin/bash

# Personal Trainer Hub - Backend Quick Start
# This script helps you set up the backend quickly

set -e  # Exit on error

echo "🚀 Personal Trainer Hub - Backend Setup"
echo "======================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    echo "   Please run this script from the backend/ directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env with your database credentials:"
    echo "   • POSTGRES_PASSWORD"
    echo "   • DATABASE_TYPE (postgresql/mongodb/both)"
    echo "   • MONGO_URI (if using MongoDB)"
    echo ""
fi

echo "📊 Database Setup Help:"
echo "======================"
echo ""
echo "1️⃣  PostgreSQL (Recommended for starting):"
echo "   macOS:   brew install postgresql@15 && brew services start postgresql@15"
echo "   Linux:   sudo apt-get install postgresql && sudo systemctl start postgresql"
echo "   Docker:  docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15"
echo ""
echo "2️⃣  MongoDB:"
echo "   macOS:   brew install mongodb-community && brew services start mongodb-community"
echo "   Linux:   sudo apt-get install mongodb-org && sudo systemctl start mongod"
echo "   Docker:  docker run -d -p 27017:27017 mongo:6.0"
echo ""

read -p "Have you set up your database? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Please set up your database first, then run this script again"
    exit 0
fi

echo ""
echo "🚀 Starting backend server..."
echo "   Server will run at: http://localhost:3000"
echo ""
echo "💡 Next steps:"
echo "   1. Open http://localhost:3000/health in browser"
echo "   2. Should show: {\"status\":\"ok\",\"database\":\"...\"}"
echo "   3. Update frontend DataService.js:"
echo "      • Set BASE_URL = 'http://localhost:3000'"
echo "      • Set USE_LOCAL_STORAGE = false"
echo ""

npm run dev
