@echo off
REM ============================================================================
REM AVVIO SERVER WEBONE - LOCAL VERSION (solo questo PC)
REM Differenze rispetto a start_servers.bat originale:
REM   - Usa npm.cmd invece di npm (fix blocco PowerShell su questo PC)
REM   - general-configuration_web: skip se non esiste
REM ============================================================================
setlocal enabledelayedexpansion

echo.
echo ==========================================================================
echo  AVVIO SERVER WEBONE (versione locale)
echo  Backend + General-Config + Frontend in finestre separate
echo ==========================================================================
echo.

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%WebOne\backend_webbone
set GEN_CONFIG_DIR=%SCRIPT_DIR%general-configuration_web
set FRONTEND_DIR=%SCRIPT_DIR%WebOne\frontend_webbone

echo Directory progetto : %SCRIPT_DIR%
echo Backend            : %BACKEND_DIR%
echo GenConfig          : %GEN_CONFIG_DIR%
echo Frontend           : %FRONTEND_DIR%
echo.

REM ============================================================================
REM Verifica directory obbligatorie
REM ============================================================================
if not exist "%BACKEND_DIR%" (
    echo [ERRORE] Directory backend non trovata: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo [ERRORE] Directory frontend non trovata: %FRONTEND_DIR%
    pause
    exit /b 1
)

REM ============================================================================
REM [1/3] Backend
REM ============================================================================
echo [1/3] Avvio Backend (porta 5000)...
start "WebOne - Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo === BACKEND WEBONE PORT 5000 === && echo. && node server.js"

ping -n 4 127.0.0.1 > nul 2>&1

REM ============================================================================
REM [2/3] General-Configuration (skip se non presente)
REM ============================================================================
if exist "%GEN_CONFIG_DIR%" (
    echo [2/3] Avvio General-Config (porta 5002)...
    start "RailPulse - GenConfig" cmd /k "cd /d "%GEN_CONFIG_DIR%" && echo === GEN-CONFIG PORT 5002 === && echo. && node server.js"
    ping -n 4 127.0.0.1 > nul 2>&1
) else (
    echo [2/3] General-Config non trovato, saltato.
)

REM ============================================================================
REM [3/3] Frontend
REM FIX locale: usa npm.cmd invece di npm (blocco execution policy PowerShell)
REM ============================================================================
echo [3/3] Avvio Frontend dev server (npm.cmd)...
start "WebOne - Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo === FRONTEND WEBONE DEV === && echo. && npm.cmd run dev"

echo.
echo ==========================================================================
echo  SERVER AVVIATI
echo  Backend   : http://localhost:5000
echo  GenConfig : http://localhost:5002  (se presente)
echo  Frontend  : http://localhost:5173
echo ==========================================================================
echo.
echo Per fermare i server, chiudi le rispettive finestre.
echo.
pause
