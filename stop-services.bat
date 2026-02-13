@echo off
echo Deteniendo servicios de desarrollo...
docker-compose -f docker-compose.dev.yml down
echo Servicios detenidos.
pause
