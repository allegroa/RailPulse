@echo off
title RailPulse Track-View Module
echo ==============================================
echo Avvio di track-view (Vite + Express)
echo ==============================================
echo.

set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend

echo [1/2] Avvio Backend server (Porta 5003)...
start "Track-View - Backend" cmd /k "cd /d %BACKEND_DIR% && node server.js"

timeout /t 2 /nobreak

echo [2/2] Avvio Frontend dev server (Porta 3000)...
start "Track-View - Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ==============================================
echo Server avviati!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5003
echo ==============================================
pause
