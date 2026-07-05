@echo off
title RailPulse Maintenance Module
echo ==============================================
echo Avvio del modulo maintenance-web sulla porta 5001
echo ==============================================
echo.
cd /d %~dp0
node server.js
pause
