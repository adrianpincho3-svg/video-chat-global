@echo off
echo Iniciando servicios de desarrollo (Redis y PostgreSQL)...
docker-compose -f docker-compose.dev.yml up -d
echo.
echo Servicios iniciados:
echo - Redis: localhost:6379
echo - PostgreSQL: localhost:5432
echo.
echo Para detener los servicios, ejecuta: stop-services.bat
pause
