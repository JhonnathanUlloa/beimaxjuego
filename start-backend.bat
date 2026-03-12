@echo off
chcp 65001 >nul
setlocal

:: Ir a la carpeta del proyecto (funciona sin importar desde donde lo ejecutes)
cd /d "%~dp0"

cls

:: ── Verificar que las dependencias esten instaladas ────────────────
if not exist "backend\node_modules" (
    echo.
    echo  ERROR: Las librerias no estan instaladas.
    echo.
    echo  Ejecuta primero:  install.bat
    echo.
    pause
    exit /b 1
)

:: ── Obtener IP local de red ─────────────────────────────────────────
set LOCAL_IP=No detectada
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set RAW=%%a
    setlocal enabledelayedexpansion
    set RAW=!RAW: =!
    :: Ignorar IPs de VPN/Loopback (169.x y 127.x)
    echo !RAW! | findstr /v "^169\. ^127\." >nul 2>&1
    if !ERRORLEVEL! == 0 (
        endlocal
        set LOCAL_IP=%%a
        set LOCAL_IP=%LOCAL_IP: =%
        goto :ip_found
    )
    endlocal
)
:ip_found

:: ── Crear .env si no existe ─────────────────────────────────────────
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        echo PORT=3000> "backend\.env"
        echo JWT_SECRET=beimax-secret-cambia-esto-en-produccion>> "backend\.env"
    )
)

:: ── Mostrar informacion ─────────────────────────────────────────────
cls
echo.
echo  =====================================================
echo   BEIMAX  ^|  Servidor iniciando...
echo  =====================================================
echo.
echo  COMO JUGAR:
echo.
echo  [En esta computadora]
echo    Abre tu navegador y ve a:
echo    http://localhost:3000
echo.
if "%LOCAL_IP%"=="No detectada" (
    echo  [Otros dispositivos en la misma red WiFi]
    echo    No se pudo detectar la IP local.
    echo    Usa ipconfig para encontrarla manualmente.
) else (
    echo  [Otros dispositivos en la misma red WiFi]
    echo    Abre el navegador y ve a:
    echo    http://%LOCAL_IP%:3000
    echo.
    echo  MULTIJUGADOR / BATALLAS ONLINE:
    echo    Ambos jugadores deben usar la IP de red:
    echo    http://%LOCAL_IP%:3000
    echo    (el servidor WebSocket usa el mismo puerto)
)
echo.
echo  =====================================================
echo  Presiona Ctrl+C para detener el servidor
echo  =====================================================
echo.

:: ── Abrir navegador automaticamente (espera 2s al servidor) ────────
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

:: ── Iniciar servidor ────────────────────────────────────────────────
cd backend
node server.js

:: ── Si el servidor se cierra con error ─────────────────────────────
echo.
echo  El servidor se detuvo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  POSIBLES CAUSAS DEL ERROR:
    echo    - El puerto 3000 esta en uso por otro programa
    echo    - Falta algun archivo del proyecto
    echo    - Ejecuta install.bat si no lo has hecho
)
echo.
pause
