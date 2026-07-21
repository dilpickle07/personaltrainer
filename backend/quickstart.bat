@echo off
REM Personal Trainer Hub - Backend Quick Start (Windows)
REM This script helps you set up the backend quickly

setlocal enabledelayedexpansion

echo.
echo 🚀 Personal Trainer Hub - Backend Setup
echo =======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ package.json not found
    echo    Please run this script from the backend\ directory
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚙️  Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env created
    echo.
    echo ⚠️  IMPORTANT: Edit .env with your database credentials:
    echo    * POSTGRES_PASSWORD
    echo    * DATABASE_TYPE (postgresql/mongodb/both^)
    echo    * MONGO_URI (if using MongoDB^)
    echo.
)

echo 📊 Database Setup Help:
echo ======================
echo.
echo 1️⃣  PostgreSQL (Recommended for starting^):
echo    Download: https://www.postgresql.org/download/windows/
echo    Run installer, remember the password
echo    Docker:   docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
echo.
echo 2️⃣  MongoDB:
echo    Download: https://www.mongodb.com/try/download/community
echo    Run installer
echo    Docker:   docker run -d -p 27017:27017 mongo:6.0
echo.

set /p dbready="Have you set up your database? (y/n) "
if /i not "%dbready%"=="y" (
    echo ⏸️  Please set up your database first, then run this script again
    pause
    exit /b 0
)

echo.
echo 🚀 Starting backend server...
echo    Server will run at: http://localhost:3000
echo.
echo 💡 Next steps:
echo    1. Open http://localhost:3000/health in browser
echo    2. Should show: {"status":"ok","database":"..."}
echo    3. Update frontend DataService.js:
echo       * Set BASE_URL = 'http://localhost:3000'
echo       * Set USE_LOCAL_STORAGE = false
echo.

call npm run dev
if errorlevel 1 (
    echo ❌ Failed to start server
    pause
    exit /b 1
)

pause
