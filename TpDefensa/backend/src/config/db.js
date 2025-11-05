const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};

