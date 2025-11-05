const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const duenio = await prisma.usuario.upsert({
    where: { email: 'duenio@example.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'duenio@example.com',
      passwordHash,
      rol: 'DUENIO',
    },
  });

  const inspector = await prisma.usuario.upsert({
    where: { email: 'inspector@example.com' },
    update: {},
    create: {
      nombre: 'Carlos Inspector',
      email: 'inspector@example.com',
      passwordHash,
      rol: 'INSPECTOR',
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      nombre: 'Admin Sistema',
      email: 'admin@example.com',
      passwordHash,
      rol: 'ADMIN',
    },
  });

  const vehiculo = await prisma.vehiculo.upsert({
    where: { patente: 'ABC123' },
    update: {},
    create: {
      patente: 'ABC123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2020,
      idDuenio: duenio.id,
    },
  });

  console.log('Seed completado exitosamente');
  console.log('Usuarios creados:', {
    duenio: duenio.email,
    inspector: inspector.email,
    admin: admin.email,
  });
  console.log('Vehículo creado:', vehiculo.patente);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

