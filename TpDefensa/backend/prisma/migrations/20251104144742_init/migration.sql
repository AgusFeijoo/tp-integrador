-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('DUENIO', 'INSPECTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "EstadoResultado" AS ENUM ('SEGURO', 'RECHEQUEAR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "id_duenio" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "id_vehiculo" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "estado_turno" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chequeos" (
    "id" TEXT NOT NULL,
    "id_turno" TEXT NOT NULL,
    "id_inspector" TEXT NOT NULL,
    "estado_resultado" "EstadoResultado",
    "total_puntaje" INTEGER,
    "observacion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chequeos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntuaciones_item" (
    "id" TEXT NOT NULL,
    "id_chequeo" TEXT NOT NULL,
    "numero_item" INTEGER NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntuaciones_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_patente_key" ON "vehiculos"("patente");

-- CreateIndex
CREATE UNIQUE INDEX "chequeos_id_turno_key" ON "chequeos"("id_turno");

-- CreateIndex
CREATE UNIQUE INDEX "puntuaciones_item_id_chequeo_numero_item_key" ON "puntuaciones_item"("id_chequeo", "numero_item");

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_id_duenio_fkey" FOREIGN KEY ("id_duenio") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chequeos" ADD CONSTRAINT "chequeos_id_turno_fkey" FOREIGN KEY ("id_turno") REFERENCES "turnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chequeos" ADD CONSTRAINT "chequeos_id_inspector_fkey" FOREIGN KEY ("id_inspector") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntuaciones_item" ADD CONSTRAINT "puntuaciones_item_id_chequeo_fkey" FOREIGN KEY ("id_chequeo") REFERENCES "chequeos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
