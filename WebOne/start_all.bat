@echo off
title Avvio WebOne Completo
echo ==============================================
echo Avvio WebOne: Backend e Frontend
echo ==============================================
echo.
start "WebOne Backend (5000)" cmd /k "%~dp0start_backend.bat"
start "RailPulse GenConfig (5002)" cmd /k "%~dp0..\general-configuration_web\start_general_config.bat"
start "WebOne Frontend (5173)" cmd /k "%~dp0start_frontend.bat"
echo Servizi avviati nelle rispettive finestre.
echo Frontend disponibile a: http://localhost:5173/webone/
pause
