const { prisma } = require('../config/db');

class VehiculoRepository {
  async findByPatente(patente) {
    return await prisma.vehiculo.findUnique({
      where: { patente },
    });
  }

  async findById(id) {
    return await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        duenio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.vehiculo.create({
      data,
      include: {
        duenio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async findByDuenio(idDuenio) {
    return await prisma.vehiculo.findMany({
      where: { idDuenio },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = new VehiculoRepository();

