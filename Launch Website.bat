@echo off
setlocal enabledelayedexpansion
title Ultimate Perspective Launcher
cd /d "%~dp0"

echo =========================================================
echo          Launching Ultimate Perspective Website
echo =========================================================
echo.

REM Add standard Node.js paths to PATH in case user environment is missing them
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm"

REM 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

REM 2. Check and install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Installing packages...
    echo This only happens on the first run. Please wait...
    echo.
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies. Please check your internet connection.
        echo.
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully.
    echo.
)

REM 3. Launch local dev server and open browser
echo [INFO] Starting web server and opening browser...
echo [INFO] Address: http://localhost:5173/
echo.
echo =========================================================
echo   The website will open automatically in your browser.
echo   Keep this window open while viewing the website.
echo   Press Ctrl+C or close this window to stop the server.
echo =========================================================
echo.

call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server stopped with error code %errorlevel%.
    pause
)
