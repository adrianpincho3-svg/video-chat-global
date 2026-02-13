@echo off
echo ========================================
echo Iniciando Backend Local
echo ========================================
echo.

cd packages\backend

echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor en http://localhost:4000
echo Presiona Ctrl+C para detener
echo.

call npm run dev
