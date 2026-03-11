@echo off
echo ========================================
echo       INSTALACION DE BEIMAX
echo ========================================
echo.

echo [1/3] Instalando dependencias del backend...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias
    echo Asegurate de tener Node.js instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/3] Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado. IMPORTANTE: Edita .env y cambia JWT_SECRET
) else (
    echo Archivo .env ya existe, omitiendo...
)

echo.
echo [3/3] Instalacion completada!
echo.
echo ========================================
echo   COMO INICIAR EL JUEGO:
echo ========================================
echo.
echo 1. Ejecuta: start-backend.bat
echo 2. Abre index.html en tu navegador
echo.
echo ========================================
echo.
pause
