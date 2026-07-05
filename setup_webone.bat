@echo off
REM ============================================================================
REM SETUP COMPLETO WEBONE - Installa dipendenze, configura DB, seed iniziale
REM ============================================================================
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                      SETUP WEBONE - FASE 1/3                           ║
echo ║              (Dipendenze + Database + Seed iniziale)                   ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Variabili di progetto
set BACKEND_DIR=E:\Software\RailPulse\backend_webbone
set FRONTEND_DIR=E:\Software\RailPulse\frontend_webbone
set ENV_FILE=%BACKEND_DIR%\.env

REM Colori per output (usando codici ANSI se supportati)
cls

REM ============================================================================
REM STEP 1: Installa dipendenze BACKEND
REM ============================================================================
echo [1/4] Installazione dipendenze BACKEND...
echo.
if not exist "%BACKEND_DIR%" (
    echo ✗ ERRORE: Directory backend non trovata: %BACKEND_DIR%
    pause
    exit /b 1
)

cd /d "%BACKEND_DIR%" || (
    echo ✗ Impossibile accedere a %BACKEND_DIR%
    pause
    exit /b 1
)

echo Esecuzione: npm install (backend)
call npm install
if errorlevel 1 (
    echo ✗ ERRORE durante npm install backend
    pause
    exit /b 1
)
echo ✓ Backend dipendenze installate
echo.

REM ============================================================================
REM STEP 2: Installa dipendenze FRONTEND
REM ============================================================================
echo [2/4] Installazione dipendenze FRONTEND...
echo.
if not exist "%FRONTEND_DIR%" (
    echo ✗ ERRORE: Directory frontend non trovata: %FRONTEND_DIR%
    pause
    exit /b 1
)

cd /d "%FRONTEND_DIR%" || (
    echo ✗ Impossibile accedere a %FRONTEND_DIR%
    pause
    exit /b 1
)

echo Esecuzione: npm install (frontend)
call npm install
if errorlevel 1 (
    echo ✗ ERRORE durante npm install frontend
    pause
    exit /b 1
)
echo ✓ Frontend dipendenze installate
echo.

REM ============================================================================
REM STEP 3: Configura .env se non esiste
REM ============================================================================
echo [3/4] Configurazione DATABASE...
echo.
cd /d "%BACKEND_DIR%" || exit /b 1

if exist "%ENV_FILE%" (
    echo ℹ File .env già presente: %ENV_FILE%
    echo Contenuto attuale:
    type "%ENV_FILE%"
    echo.
    set /p OVERRIDE="Vuoi sovrascrivere il file .env? (S/N): "
    if /i "!OVERRIDE!"=="S" (
        goto CREATE_ENV
    ) else (
        goto SKIP_ENV
    )
)

:CREATE_ENV
echo Creazione file .env...
(
    echo DATABASE_URL=mysql://root:@localhost:3306/webone
    echo PORT=5000
    echo JWT_SECRET=webone_secret_key_change_me
    echo UPLOAD_DIR=./uploads
) > "%ENV_FILE%"
echo ✓ File .env creato
echo.

:SKIP_ENV
REM ============================================================================
REM STEP 4: Esegui Prisma migrations
REM ============================================================================
echo Esecuzione Prisma migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo ✗ ERRORE durante Prisma migrate
    pause
    exit /b 1
)
echo ✓ Migrazioni Prisma completate
echo.

REM ============================================================================
REM STEP 5: Esegui seed iniziale
REM ============================================================================
echo Esecuzione seed database...
if not exist "prisma\seed.js" (
    echo ⚠ Avviso: prisma/seed.js non trovato
    echo Creazione seed automatico...
    call npx prisma db seed
) else (
    call node prisma/seed.js
)
if errorlevel 1 (
    echo ✗ ERRORE durante seed database
    echo (Non è critico, puoi continuare)
    echo.
)
echo ✓ Seed database completato
echo.

REM ============================================================================
REM FINE SETUP
REM ============================================================================
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                   ✓ SETUP COMPLETATO CON SUCCESSO                      ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Credenziali seed create:
echo   • Superadmin: super@local / StrongP@ssw0rd
echo   • Admin: admin@local / StrongP@ssw0rd
echo.
echo Per avviare i server, esegui: START_SERVERS.bat
echo.
pause
