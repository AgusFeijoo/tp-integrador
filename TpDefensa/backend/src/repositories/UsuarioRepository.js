const { prisma } = require('../config/db');

class UsuarioRepository {
  async findByEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data) {
    return await prisma.usuario.create({
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByIdWithVehiculos(id) {
    return await prisma.usuario.findUnique({
      where: { id },
      include: {
        vehiculos: true,
      },
    });
  }
}

module.exports = new UsuarioRepository();

