@echo off
setlocal
echo ==================================================
echo Inizio Backup Giornaliero WebOne
echo %date% %time%
echo ==================================================

set "SOURCE_DIR=D:\004_Software\WebOne"
set "DEST_DIR=G:\Il mio Drive\GESTIONE TITS\99_PROGETTI\P2604 - RAMSYS\WebOne_Backup"

:: Use Robocopy to mirror the directory
:: /MIR  - Mirror a directory tree (equivalent to /E plus /PURGE)
:: /XD   - Exclude directories matching the given names/paths
:: /R:1  - Number of retries on failed copies
:: /W:1  - Wait time between retries (seconds)
:: /NP   - No Progress - don't display % copied
:: /NDL  - No Directory List - don't log directory names
:: /MT:4 - Multithreaded copy with 4 threads

robocopy "%SOURCE_DIR%" "%DEST_DIR%" /MIR /XD node_modules .git .gemini uploads dist /R:1 /W:1 /NP /MT:4

echo.
echo ==================================================
echo Backup Completato!
echo %date% %time%
echo ==================================================
endlocal
pause
