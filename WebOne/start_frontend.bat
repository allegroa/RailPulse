@echo off
title WebOne Frontend
echo ==============================================
echo Avvio del Frontend WebOne (Vite) sulla porta 5173
echo ==============================================
echo.
cd /d "%~dp0frontend_webbone"
set PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs;C:\Program Files\nodejs;%PATH%
npm run dev
pause
