@echo off
title Agrisense Pro - Startup Launcher
setlocal enabledelayedexpansion

echo =======================================================================
echo               AGRISENSE PRO - ARECANUT ORCHARD MANAGEMENT
echo                         SYSTEM LAUNCHER
echo =======================================================================
echo.

:: Get project directory
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: Check Python installation
echo [*] Checking for Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and add it to your PATH.
    pause
    exit /b 1
)
echo [OK] Python is available.

:: Check Node.js / NPM installation
echo [*] Checking for Node.js / NPM...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM is not installed or not in your PATH.
    echo Please install Node.js LTS version and add it to your PATH.
    pause
    exit /b 1
)
echo [OK] NPM is available.

:: Check / Setup Backend Dependencies
echo.
echo [*] Checking Backend Dependencies...
cd /d "%PROJECT_DIR%backend"
:: Quick check if libraries are importable
python -c "import fastapi, uvicorn, pydantic, sqlalchemy, pymongo, influxdb_client, redis" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Some Python dependencies are missing. Installing them now...
    python -m pip install -r requirements.txt
    if !errorlevel! neq 0 (
        echo [WARNING] Failed to install some python dependencies. Startup might fail.
    ) else (
        echo [OK] Backend dependencies installed successfully.
    )
) else (
    echo [OK] All Python dependencies are present.
)

:: Check Backend .env
if not exist ".env" (
    echo [!] Warning: .env file missing in backend directory. Creating one...
    echo GEMINI_API_KEY= > .env
    echo [!] Created empty backend\.env. Please paste your Gemini API Key in it.
)

:: Check / Setup Frontend Dependencies
echo.
echo [*] Checking Frontend Dependencies...
cd /d "%PROJECT_DIR%frontend"
if not exist "node_modules\" (
    echo [!] node_modules not found in frontend directory. Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to run 'npm install'. Cannot launch frontend.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed successfully.
) else (
    echo [OK] Frontend dependencies are present.
)

:: Start Servers
echo.
echo =======================================================================
echo   Launching Servers...
echo =======================================================================
echo.

echo [*] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Agrisense Backend (FastAPI)" cmd /k "cd /d "%PROJECT_DIR%backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
ping 127.0.0.1 -n 4 >nul

echo [*] Starting Vite Frontend on http://localhost:3001 ...
start "Agrisense Frontend (Vite)" cmd /k "cd /d "%PROJECT_DIR%frontend" && npm run dev"

:: Wait a moment and then open the browser
ping 127.0.0.1 -n 4 >nul
echo [*] Opening Agrisense Pro in your browser...
start http://localhost:3001

echo.
echo =======================================================================
echo   Startup completed!
echo   1. Keep the two command prompt windows open.
echo   2. You can access the UI at http://localhost:3001
echo   3. The API documentation is available at http://127.0.0.1:8000/docs
echo =======================================================================
echo.
pause
