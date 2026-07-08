@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py -3 "%SCRIPT_DIR%start_server_manager.py" %*
) else (
    python "%SCRIPT_DIR%start_server_manager.py" %*
)
