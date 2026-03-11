@echo off
echo ========================================
echo    INICIANDO SERVIDOR BEIMAX
echo ========================================
echo.

cd backend

if not exist node_modules (
    echo ERROR: Dependencias no instaladas
    echo Ejecuta primero: install.bat
    pause
    exit /b 1
)

if not exist .env (
    echo ADVERTENCIA: Archivo .env no encontrado
    echo Copiando .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edita backend\.env y cambia JWT_SECRET
    echo.
)

echo Servidor iniciando en http://localhost:3000
echo.
echo Abre http://localhost:3000 en tu navegador para jugar
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

node server.js
