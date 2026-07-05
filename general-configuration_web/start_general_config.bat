@echo off
title RailPulse General Configuration Module
echo =======================================================
echo Avvio del modulo general-configuration_web sulla porta 5002
echo =======================================================
echo.
cd /d %~dp0
node server.js
pause
