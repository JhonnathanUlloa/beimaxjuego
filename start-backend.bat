@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

cls

:: Verificar dependencias
if not exist "backend\node_modules" (
    echo.
    echo  ERROR: Las librerias no estan instaladas.
    echo  Ejecuta primero: install.bat
    echo.
    pause
    exit /b 1
)

:: Crear .env si no existe
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        echo PORT=3000> "backend\.env"
        echo JWT_SECRET=beimax-secret-cambia-esto-en-produccion>> "backend\.env"
    )
)

:: Detectar IP local de red
set "LOCAL_IP=No detectada"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "CANDIDATE=%%a"
    set "CANDIDATE=!CANDIDATE: =!"
    echo !CANDIDATE! | findstr /v "^169\." | findstr /v "^127\." >nul 2>&1
    if !ERRORLEVEL! == 0 (
        set "LOCAL_IP=!CANDIDATE!"
    )
)

cls
echo.
echo  =====================================================
echo   BEIMAX - Servidor iniciando...
echo  =====================================================
echo.
echo  [En esta computadora]
echo    http://localhost:3000
echo.
if "!LOCAL_IP!"=="No detectada" (
    echo  [Otros dispositivos]
    echo    No se pudo detectar la IP. Usa ipconfig manualmente.
) else (
    echo  [Otros dispositivos en la misma red]
    echo    http://!LOCAL_IP!:3000
    echo.
    echo  MULTIJUGADOR - Ambos jugadores deben usar la IP de red.
    echo  El WebSocket usa el mismo puerto 3000.
)
echo.
echo  Presiona Ctrl+C para detener el servidor
echo  =====================================================
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

cd backend
node server.js

echo.
echo  El servidor se detuvo.
echo.
echo  POSIBLES CAUSAS:
echo    - El puerto 3000 esta en uso por otro programa
echo    - Ejecuta install.bat si aun no instalaste las dependencias
echo.
pause
