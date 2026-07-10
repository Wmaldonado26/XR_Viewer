@echo off
echo ========================================
echo Iniciando Backend SQLite - Puerto 5000
echo ========================================
echo.

cd backend
echo Backend directory: %CD%
echo.

echo Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando servidor...
echo.
call npm start
