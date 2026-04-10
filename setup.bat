@echo off
REM FieldOps Quick Start Script for Windows

echo.
echo ==========================================
echo FieldOps - Quick Start Setup (Windows)
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

echo Step 1: Install Backend Dependencies
echo ==========================================
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

echo Step 2: Create Backend Environment File
echo ==========================================
if not exist .env (
    copy ..\.env.example .env
    echo ✅ Created backend\.env from template
) else (
    echo ✅ backend\.env already exists
)
echo.

echo Step 3: Install Frontend Dependencies
echo ==========================================
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

echo Step 4: Create Frontend Environment File
echo ==========================================
if not exist .env.local (
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:5000
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    ) > .env.local
    echo ✅ Created frontend\.env.local
) else (
    echo ✅ frontend\.env.local already exists
)
echo.

echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo PowerShell/CMD Window 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo PowerShell/CMD Window 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then visit: http://localhost:3000
echo.
echo Demo Credentials:
echo   Admin:      admin@fieldops.local / Admin@123!
echo   Technician: tech@fieldops.local / Tech@123!
echo   Client:     client@fieldops.local / Client@123!
echo.
pause
