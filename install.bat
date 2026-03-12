@echo off
chcp 65001 >nul
setlocal

:: Ir a la carpeta del proyecto (funciona sin importar desde donde lo ejecutes)
cd /d "%~dp0"

cls
echo.
echo  =====================================================
echo   BEIMAX  ^|  Instalacion inicial
echo  =====================================================
echo.
echo  Este script instala todo lo necesario para que
echo  el juego funcione en tu computadora.
echo.
echo  Que va a hacer:
echo    1. Verificar que Node.js este instalado
echo    2. Instalar las librerias del servidor
echo    3. Crear el archivo de configuracion (.env)
echo.
echo  =====================================================
echo.
pause

:: ── PASO 1: Verificar Node.js ────────────────────────
echo.
echo  [1/3]  Verificando Node.js...
echo.

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js no esta instalado.
    echo.
    echo  Para instalar Node.js:
    echo    1. Ve a https://nodejs.org
    echo    2. Descarga la version LTS (recomendada)
    echo    3. Instala con todas las opciones por defecto
    echo    4. Cierra y abre de nuevo esta ventana
    echo    5. Vuelve a ejecutar install.bat
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  OK - Node.js %NODE_VER% detectado

:: ── PASO 2: Instalar dependencias ────────────────────
echo.
echo  [2/3]  Instalando librerias del servidor...
echo  (esto puede tardar 1-2 minutos la primera vez)
echo.

cd backend
call npm install --loglevel=error

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: No se pudieron instalar las librerias.
    echo.
    echo  Posibles causas:
    echo    - Sin conexion a internet
    echo    - Antivirus bloqueando npm
    echo.
    pause
    exit /b 1
)

echo  OK - Librerias instaladas correctamente

:: ── PASO 3: Crear .env ───────────────────────────────
echo.
echo  [3/3]  Configurando archivo de entorno...
echo.

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo  OK - Archivo .env creado desde .env.example
    ) else (
        :: Crear un .env minimo si no hay ejemplo
        echo PORT=3000> .env
        echo JWT_SECRET=beimax-secret-cambia-esto-en-produccion>> .env
        echo  OK - Archivo .env creado con valores por defecto
    )
    echo.
    echo  NOTA: El archivo backend\.env tiene la clave JWT_SECRET.
    echo  Para uso privado no necesitas cambiarlo.
) else (
    echo  OK - Archivo .env ya existe, sin cambios
)

cd ..

:: ── LISTO ────────────────────────────────────────────
cls
echo.
echo  =====================================================
echo   BEIMAX  ^|  Instalacion completada con exito!
echo  =====================================================
echo.
echo  Para jugar solo tienes que:
echo.
echo    1. Doble clic en  start-backend.bat
echo       (el servidor se inicia y el juego se abre solo)
echo.
echo    2. Cuando termines de jugar, cierra la
echo       ventana negra del servidor (o Ctrl+C)
echo.
echo  MULTIJUGADOR EN LA MISMA RED:
echo    Los dos dispositivos deben estar conectados
echo    al mismo WiFi. El start-backend.bat muestra
echo    la direccion IP que deben usar.
echo.
echo  =====================================================
echo.
pause
