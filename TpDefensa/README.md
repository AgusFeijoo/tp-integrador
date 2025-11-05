# Sistema de Gestión de Chequeos Técnicos de Vehículos

## Descripción del Proyecto

Este proyecto es un sistema backend desarrollado para gestionar el proceso de chequeos técnicos de vehículos. El sistema permite a diferentes actores (dueños de vehículos, inspectores y administradores) interactuar en el flujo completo desde la solicitud de turnos hasta la finalización de chequeos con evaluación de ítems.

### Actores del Sistema

- **DUEÑO**: Propietario de vehículos que puede solicitar turnos para chequeos técnicos y consultar los resultados de los mismos.
- **INSPECTOR**: Profesional encargado de realizar los chequeos técnicos, evaluar los ítems del vehículo y finalizar el proceso.
- **ADMIN**: Administrador del sistema con permisos para gestionar usuarios, vehículos y confirmar turnos.

### Flujo Principal

1. El dueño solicita un turno para un vehículo en una fecha/hora disponible.
2. Un inspector o administrador confirma el turno.
3. Un inspector realiza un chequeo sobre ese turno.
4. El chequeo evalúa exactamente 8 ítems del vehículo, cada uno calificado con un puntaje entero entre 1 y 10.
5. Se calcula un total sumando los 8 ítems.
6. Según el total y los valores individuales, se determina el estado final del vehículo (SEGURO o RECHEQUEAR).

### Reglas de Negocio

- **Regla 1**: Si el total >= 80 y NO hay ningún ítem con valor < 5 → estado = "SEGURO".
- **Regla 2**: Si el total < 40 → estado = "RECHEQUEAR" y es OBLIGATORIO registrar una observación para el dueño.
- **Regla 3**: Si al menos un ítem tiene valor < 5 (aunque el total sea alto) → estado = "RECHEQUEAR".
- Siempre deben existir EXACTAMENTE 8 ítems por chequeo.
- Cada ítem debe estar en el rango 1..10.
- Un chequeo solo se puede "finalizar" si tiene los 8 ítems cargados.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript
- **Express**: Framework web para Node.js
- **PostgreSQL**: Base de datos relacional
- **Prisma**: ORM para la gestión de la base de datos
- **JWT**: Autenticación mediante JSON Web Tokens
- **Jest**: Framework de testing unitario
- **Supertest**: Librería para testing de endpoints HTTP
- **Docker Compose**: Orquestación de contenedores para desarrollo

## Requisitos Previos

- Node.js (versión 18 o superior)
- Docker y Docker Compose
- npm o yarn

## Instalación y Configuración

### Opción 1: Con Docker Compose (Recomendado)

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd proyecto-control-vehiculos
```

2. Crear el archivo de variables de entorno:
```bash
cd backend
cp .env.example .env
```

3. Editar el archivo `.env` con las configuraciones necesarias (opcional, los valores por defecto funcionan para desarrollo):
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/control_vehiculos?schema=public"
JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

4. Levantar los servicios:
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

5. Ejecutar las migraciones de Prisma:
```bash
docker-compose exec api npm run migrate
```

El servidor estará disponible en `http://localhost:3000`.

### Opción 2: Sin Docker (Desarrollo Local)

1. Instalar PostgreSQL localmente y crear una base de datos:
```sql
CREATE DATABASE control_vehiculos;
```

2. Clonar el repositorio y entrar a la carpeta backend:
```bash
git clone <url-del-repositorio>
cd proyecto-control-vehiculos/backend
```

3. Instalar dependencias:
```bash
npm install
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con la conexión a tu base de datos local:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/control_vehiculos?schema=public"
JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

5. Generar el cliente de Prisma:
```bash
npm run prisma:generate
```

6. Ejecutar migraciones:
```bash
npm run migrate
```

7. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

```
proyecto-control-vehiculos/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Configuración de Express
│   │   ├── server.js               # Punto de entrada del servidor
│   │   ├── config/
│   │   │   └── db.js               # Configuración de Prisma
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Rutas de autenticación
│   │   │   ├── turnos.routes.js    # Rutas de turnos
│   │   │   └── chequeos.routes.js  # Rutas de chequeos
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── TurnoController.js
│   │   │   └── ChequeoController.js
│   │   ├── services/
│   │   │   ├── AuthService.js
│   │   │   ├── TurnoService.js
│   │   │   ├── ChequeoService.js
│   │   │   └── EvaluadorReglas.js  # Lógica pura de reglas de negocio
│   │   ├── repositories/
│   │   │   ├── UsuarioRepository.js
│   │   │   ├── VehiculoRepository.js
│   │   │   ├── TurnoRepository.js
│   │   │   ├── ChequeoRepository.js
│   │   │   └── PuntuacionItemRepository.js
│   │   └── middleware/
│   │       ├── authMiddleware.js   # Verificación de JWT y roles
│   │       └── errorHandler.js     # Manejo centralizado de errores
│   ├── prisma/
│   │   └── schema.prisma           # Schema de la base de datos
│   ├── tests/
│   │   ├── evaluadorReglas.test.js
│   │   ├── chequeoService.test.js
│   │   └── turnoService.test.js
│   ├── package.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Ejecución de Tests

Para ejecutar los tests unitarios:

```bash
# Con Docker
docker-compose exec api npm test

# Sin Docker (desde la carpeta backend)
npm test
```

Para ejecutar tests en modo watch:
```bash
npm run test:watch
```

Los tests cubren:
- Evaluación de reglas de negocio (EvaluadorReglas)
- Validaciones del servicio de chequeos
- Validaciones del servicio de turnos

## Endpoints de la API

### Autenticación

#### `POST /auth/register`
Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "rol": "DUEÑO"
}
```

**Respuesta:**
```json
{
  "usuario": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "DUEÑO"
  },
  "token": "jwt-token"
}
```

#### `POST /auth/login`
Inicia sesión y obtiene un token JWT.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "usuario": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "DUEÑO"
  },
  "token": "jwt-token"
}
```

### Turnos

#### `GET /turnos/disponibilidad?fecha=2024-12-20`
Obtiene los horarios disponibles para una fecha específica.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "fecha": "2024-12-20",
  "horariosDisponibles": [
    "2024-12-20T09:00:00.000Z",
    "2024-12-20T09:30:00.000Z",
    ...
  ]
}
```

#### `POST /turnos`
Solicita un nuevo turno para un vehículo. Solo disponible para DUEÑO.

**Headers:** `Authorization: Bearer <token>` (rol: DUEÑO)

**Body:**
```json
{
  "idVehiculo": "uuid-del-vehiculo",
  "fechaHora": "2024-12-20T10:00:00.000Z"
}
```

#### `POST /turnos/:id/confirmar`
Confirma un turno. Solo disponible para INSPECTOR o ADMIN.

**Headers:** `Authorization: Bearer <token>` (rol: INSPECTOR o ADMIN)

#### `GET /turnos/mis-turnos`
Obtiene todos los turnos del dueño autenticado. Solo disponible para DUEÑO.

**Headers:** `Authorization: Bearer <token>` (rol: DUEÑO)

### Chequeos

#### `POST /chequeos`
Inicia un chequeo para un turno. Solo disponible para INSPECTOR.

**Headers:** `Authorization: Bearer <token>` (rol: INSPECTOR)

**Body:**
```json
{
  "idTurno": "uuid-del-turno"
}
```

#### `POST /chequeos/:id/items`
Agrega ítems de evaluación a un chequeo. Solo disponible para INSPECTOR.

**Headers:** `Authorization: Bearer <token>` (rol: INSPECTOR)

**Body:**
```json
{
  "items": [
    { "numeroItem": 1, "puntaje": 8 },
    { "numeroItem": 2, "puntaje": 9 },
    ...
  ]
}
```

#### `POST /chequeos/:id/finalizar`
Finaliza un chequeo, calcula el total y determina el estado. Solo disponible para INSPECTOR.

**Headers:** `Authorization: Bearer <token>` (rol: INSPECTOR)

**Body:**
```json
{
  "observacion": "Observación opcional (obligatoria si total < 40)"
}
```

#### `GET /chequeos/:id`
Obtiene el detalle completo de un chequeo. Disponible para el dueño del vehículo, el inspector o admin.

**Headers:** `Authorization: Bearer <token>`

## Modelo de Datos

El sistema utiliza las siguientes tablas principales:

- **usuarios**: Almacena información de usuarios (dueños, inspectores, admins)
- **vehiculos**: Información de vehículos asociados a dueños
- **turnos**: Turnos solicitados para chequeos
- **chequeos**: Chequeos realizados sobre turnos
- **puntuaciones_item**: Puntuaciones de los 8 ítems evaluados en cada chequeo

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta los tests unitarios
- `npm run test:watch`: Ejecuta tests en modo watch
- `npm run migrate`: Ejecuta migraciones de Prisma
- `npm run prisma:generate`: Genera el cliente de Prisma
- `npm run prisma:studio`: Abre Prisma Studio para visualizar la base de datos

## Notas Importantes

- Los tokens JWT expiran después de 24 horas por defecto (configurable en `.env`)
- Las contraseñas se almacenan con hash usando bcrypt
- El sistema valida que los turnos solo puedan ser confirmados si están en estado PENDIENTE
- Los chequeos requieren exactamente 8 ítems antes de poder finalizarse
- Si el total de puntuación es menor a 40, la observación es obligatoria

## Contribución

Este es un proyecto académico. Para cualquier sugerencia o mejora, por favor crear un issue en el repositorio.

## Licencia

Este proyecto es parte de un trabajo académico universitario.

