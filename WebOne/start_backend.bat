@echo off
title WebOne Backend Server
echo ==============================================
echo Avvio del Backend WebOne (Node.js) sulla porta 5000
echo ==============================================
echo Questo server comunica con l'interfaccia ospitata su XAMPP.
echo Non chiudere questa finestra finche' usi WebOne.
echo.

cd /d D:\004_Software\WebOne\backend_webbone
set PATH=C:\Program Files\nodejs;%PATH%
npm start
pause
