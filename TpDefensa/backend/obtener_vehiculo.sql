-- Script para obtener el ID del vehículo del seed
-- Ejecutar: docker-compose exec db psql -U postgres -d control_vehiculos -f /app/obtener_vehiculo.sql

SELECT 
    id,
    patente,
    marca,
    modelo,
    anio,
    id_duenio,
    created_at
FROM vehiculos 
WHERE patente = 'ABC123';

