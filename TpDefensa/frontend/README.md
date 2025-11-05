# Frontend - Sistema de Control de Vehículos

Frontend sencillo y básico para probar todas las funcionalidades del backend.

## Características

- **Login**: Autenticación con diferentes roles (Dueño, Inspector, Admin)
- **Dashboard por Rol**: Interfaz adaptada según el rol del usuario
- **Funcionalidades Completas**: Todas las operaciones del backend disponibles

## Cómo Usar

1. Asegúrate de que el backend esté corriendo:
   ```bash
   docker-compose up
   ```

2. Abre el navegador y ve a:
   ```
   http://localhost:3000
   ```

3. Usa los accesos rápidos o ingresa manualmente:
   - **Dueño**: `duenio@example.com` / `password123`
   - **Inspector**: `inspector@example.com` / `password123`
   - **Admin**: `admin@example.com` / `password123`

## Funcionalidades por Rol

### Dueño (DUENIO)
- Consultar disponibilidad de turnos
- Solicitar nuevos turnos
- Ver mis turnos

### Inspector (INSPECTOR)
- Confirmar turnos
- Crear chequeos
- Agregar ítems de evaluación (8 ítems, puntaje 1-10)
- Finalizar chequeos
- Ver detalles de chequeos

### Admin (ADMIN)
- Acceso a todas las funcionalidades del Inspector

## Notas

- El frontend está servido directamente por Express desde el backend
- Los datos se guardan en localStorage para mantener la sesión
- Todas las peticiones incluyen el token JWT automáticamente
- El frontend es básico y funcional, perfecto para pruebas

