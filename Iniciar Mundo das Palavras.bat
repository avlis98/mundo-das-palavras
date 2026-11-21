@echo off
chcp 65001 >nul
title Mundo das Palavras - Servidor Local
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ===================================================
echo   MUNDO DAS PALAVRAS - Iniciando aplicativo...
echo   Mantenha esta janela aberta enquanto usar o app.
echo ===================================================
start "" "http://localhost:5173"
call npm.cmd run preview -- --port 5173 --host
pause
