@echo off
REM ============================================================================
REM AVVIO SERVER WEBONE - Backend + Frontend in finestre separate
REM ============================================================================
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    AVVIO SERVER WEBONE                                 ║
echo ║              (Backend e Frontend in finestre separate)                  ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set BACKEND_DIR=E:\Software\RailPulse\WebOne\backend_webbone
set GEN_CONFIG_DIR=E:\Software\RailPulse\general-configuration_web
set FRONTEND_DIR=E:\Software\RailPulse\WebOne\frontend_webbone

REM ============================================================================
REM Verifica che le directory esistano
REM ============================================================================
if not exist "%BACKEND_DIR%" (
    echo ✗ ERRORE: Directory backend non trovata: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo ✗ ERRORE: Directory frontend non trovata: %FRONTEND_DIR%
    pause
    exit /b 1
)

if not exist "%GEN_CONFIG_DIR%" (
    echo ✗ ERRORE: Directory general-configuration_web non trovata: %GEN_CONFIG_DIR%
    pause
    exit /b 1
)

REM ============================================================================
REM Avvia BACKEND in una nuova finestra
REM ============================================================================
echo [1/3] Avvio Backend server (WebOne)...
start "WebOne - Backend (Node.js)" cmd /k "cd /d %BACKEND_DIR% && echo ╔══════════════════════════╗ && echo ║  BACKEND WEBONE (PORT 5000) ║ && echo ╚══════════════════════════╝ && echo. && node server.js"

REM Attesa per permettere al backend di avviarsi
timeout /t 3 /nobreak

REM ============================================================================
REM Avvia GENERAL-CONFIGURATION in una nuova finestra
REM ============================================================================
echo [2/3] Avvio General-Configuration server...
start "RailPulse - GenConfig (Node.js)" cmd /k "cd /d %GEN_CONFIG_DIR% && echo ╔═════════════════════════════╗ && echo ║ GEN-CONFIG (PORT 5002) ║ && echo ╚═════════════════════════════╝ && echo. && node server.js"

REM Attesa
timeout /t 3 /nobreak

REM ============================================================================
REM Avvia FRONTEND in una nuova finestra
REM ============================================================================
echo [3/3] Avvio Frontend development server...
start "WebOne - Frontend (React)" cmd /k "cd /d %FRONTEND_DIR% && echo ╔══════════════════════════╗ && echo ║  FRONTEND WEBONE (DEV) ║ && echo ╚══════════════════════════╝ && echo. && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                   ✓ SERVER AVVIATI CORRETTAMENTE                       ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Backend:  http://localhost:5000
echo GenConfig: http://localhost:5002
echo Frontend: http://localhost:5173 (o url indicato)
echo.
echo Per fermare i server, chiudi entrambe le finestre.
echo.
pause
