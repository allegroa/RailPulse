@echo off
REM ============================================================================
REM AVVIO SERVER WEBONE - Backend + Frontend in finestre separate
REM ============================================================================
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    AVVIO SERVER WEBONE                                 ║
echo ║              (Backend e Frontend in finestre separate)                 ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM Path relativi alla posizione dello script (funziona su qualsiasi PC)
REM %~dp0 = directory dove si trova questo .bat (con trailing backslash)
REM ============================================================================
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%WebOne\backend_webbone
set GEN_CONFIG_DIR=%SCRIPT_DIR%general-configuration_web
set FRONTEND_DIR=%SCRIPT_DIR%WebOne\frontend_webbone

echo Rilevata directory progetto: %SCRIPT_DIR%
echo Backend:    %BACKEND_DIR%
echo GenConfig:  %GEN_CONFIG_DIR%
echo Frontend:   %FRONTEND_DIR%
echo.

REM ============================================================================
REM Verifica che le directory esistano
REM ============================================================================
if not exist "%BACKEND_DIR%" (
    echo X ERRORE: Directory backend non trovata: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo X ERRORE: Directory frontend non trovata: %FRONTEND_DIR%
    pause
    exit /b 1
)

if not exist "%GEN_CONFIG_DIR%" (
    echo X ERRORE: Directory general-configuration_web non trovata: %GEN_CONFIG_DIR%
    pause
    exit /b 1
)

REM ============================================================================
REM Avvia BACKEND in una nuova finestra
REM ============================================================================
echo [1/3] Avvio Backend server (WebOne)...
start "WebOne - Backend" cmd /k "cd /d %BACKEND_DIR% && echo === BACKEND WEBONE PORT 5000 === && echo. && node server.js"

REM Attesa per permettere al backend di avviarsi (ping -n 4 = ~3 secondi)
ping -n 4 127.0.0.1 > nul 2>&1

REM ============================================================================
REM Avvia GENERAL-CONFIGURATION in una nuova finestra
REM ============================================================================
echo [2/3] Avvio General-Configuration server...
start "RailPulse - GenConfig" cmd /k "cd /d %GEN_CONFIG_DIR% && echo === GEN-CONFIG PORT 5002 === && echo. && node server.js"

REM Attesa
ping -n 4 127.0.0.1 > nul 2>&1

REM ============================================================================
REM Avvia FRONTEND in una nuova finestra
REM ============================================================================
echo [3/3] Avvio Frontend development server...
start "WebOne - Frontend" cmd /k "cd /d %FRONTEND_DIR% && echo === FRONTEND WEBONE DEV === && echo. && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                   SERVER AVVIATI CORRETTAMENTE                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Backend:   http://localhost:5000
echo GenConfig: http://localhost:5002
echo Frontend:  http://localhost:5173 (o url indicato)
echo.
echo Per fermare i server, chiudi le finestre dei server.
echo.
pause
