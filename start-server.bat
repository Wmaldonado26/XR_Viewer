@echo off
title Backend COTECMAR - Puerto 5000
color 0A

echo ========================================
echo   Backend COTECMAR - Sistema 360
echo ========================================
echo.

REM Verificar si el puerto 5000 ya está en uso
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo [ADVERTENCIA] El puerto 5000 ya esta en uso
    echo.
    pause
    exit /b 1
)

echo Cambiando a directorio backend...
cd /d "%~dp0backend"

echo Directorio actual: %CD%
echo.

REM Verificar si existen las dependencias
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
    echo.
)

echo Iniciando servidor backend...
echo Backend URL: http://localhost:5000
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El servidor termino con errores
    pause
)
