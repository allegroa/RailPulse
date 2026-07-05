@echo off
title TaipeiScaffold - Frontend ^& Backend
echo.
echo ====================================================
echo             AVVIO TAIPEISCAFFOLD
echo ====================================================
echo.

echo [1/2] Esecuzione Backend (Generazione Grafi)...
python main.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRORE] Il backend ha riscontrato dei problemi durante la validazione.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Avvio Server Frontend su http://localhost:8000 ...
start http://localhost:8000/frontend/index.html
start http://localhost:8000/exports/taipei_metro_standalone.html

echo.
echo Server HTTP attivo. Premi CTRL+C per arrestarlo.
echo.
python server.py
