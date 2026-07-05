@echo off
title Sincronizzazione Backup su Google Drive
echo ==============================================
echo Sincronizzazione da D: a Google Drive in corso...
echo ==============================================

rem Usa robocopy per copiare in modo sicuro i file nuovi e modificati (ignorando node_modules e .git per non bloccare Drive)
robocopy "D:\004_Software\WebOne" "G:\Il mio Drive\GESTIONE TITS\99_PROGETTI\P2604 - RAMSYS\WebOne" /E /XO /XD node_modules .git /R:3 /W:3

echo.
echo ==============================================
echo Sincronizzazione completata con successo!
echo ==============================================
pause
