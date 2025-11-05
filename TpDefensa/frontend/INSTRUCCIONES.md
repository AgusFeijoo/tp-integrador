# Instrucciones de Uso del Frontend

## Cómo obtener el ID del vehículo

El vehículo creado en el seed tiene patente "ABC123". Para obtener su ID:

### Opción 1: Desde la base de datos
```sql
SELECT id, patente, marca, modelo FROM vehiculos WHERE patente = 'ABC123';
```

### Opción 2: Desde la consola del contenedor
```bash
docker-compose exec api npx prisma studio
```
Luego abre Prisma Studio en el navegador y busca el vehículo con patente ABC123.

### Opción 3: Consultar directamente
Puedes hacer una consulta directa a la API una vez que tengas el token del dueño, o usar el ID que aparece cuando creas un turno exitosamente.

## Flujo de trabajo recomendado

1. **Login como Dueño** (duenio@example.com / password123)
   - Consultar disponibilidad de turnos
   - Solicitar un turno (necesitas el ID del vehículo)
   - Ver tus turnos

2. **Login como Inspector** (inspector@example.com / password123)
   - Confirmar turno pendiente
   - Crear chequeo para un turno confirmado
   - Agregar los 8 ítems de evaluación
   - Finalizar chequeo

3. **Login como Admin** (admin@example.com / password123)
   - Tiene acceso a todas las funcionalidades del inspector

## Notas importantes

- Los IDs de vehículos, turnos y chequeos son UUIDs que se generan automáticamente
- El frontend auto-completa algunos campos cuando creas chequeos e ítems
- Los turnos deben estar en estado CONFIRMADO antes de crear un chequeo
- Se requieren exactamente 8 ítems para finalizar un chequeo
- Si el total es menor a 40, la observación es obligatoria

