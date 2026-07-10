@echo off
title Sistema 360 - Front + Back
color 0B

echo ========================================
echo   SISTEMA 360 - INICIANDO FRONT + BACK
echo ========================================
echo.

set ROOT=%~dp0

REM ===============================
REM           BACKEND
REM ===============================
echo [BACK] Verificando puerto 5001...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo [ERROR] El puerto 5000 ya esta en uso.
    pause
    exit /b 1
)

echo [BACK] Entrando a backend...
cd /d "%ROOT%backend"

echo [BACK] Iniciando backend en 0.0.0.0:5001...
start "BACKEND - Puerto 5000" cmd /k "node server.js"


REM ===============================
REM           FRONTEND
REM ===============================
echo.
echo [FRONT] Verificando puerto 3001...
netstat -ano | findstr :3001 > nul
if %errorlevel% equ 0 (
    echo [ERROR] El puerto 3001 ya esta en uso.
    pause
    exit /b 1
)

echo [FRONT] Entrando a frontend (raiz)...
cd /d "%ROOT%"

if not exist "node_modules\" (
    echo [FRONT] Instalando dependencias frontend...
    call npm install
)

echo [FRONT] Iniciando React accesible desde la red (HOST=0.0.0.0, PORT=3001)...
start "FRONTEND - Puerto 3001" cmd /k "set ""HOST=0.0.0.0"" && set ""PORT=3001"" && set ""BROWSER=none"" && npm start"

echo.
echo ========================================
echo   LISTO:
echo   Backend:  http://IP_DEL_SERVIDOR:5001
echo   Frontend: http://IP_DEL_SERVIDOR:3001
echo ========================================
echo.
pause
