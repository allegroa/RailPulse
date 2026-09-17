@echo off
title RailPulse General Configuration Module
echo =======================================================
echo Avvio del modulo general-configuration_web sulla porta 5002
echo =======================================================
echo.
cd /d %~dp0
set PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs;C:\Program Files\nodejs;%PATH%
node server.js
pause
