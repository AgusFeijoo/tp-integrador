const { prisma } = require('../config/db');

class PuntuacionItemRepository {
  async create(data) {
    return await prisma.puntuacionItem.create({
      data,
    });
  }

  async createMany(items) {
    return await prisma.puntuacionItem.createMany({
      data: items,
      skipDuplicates: true,
    });
  }

  async findByChequeoAndItem(idChequeo, numeroItem) {
    return await prisma.puntuacionItem.findUnique({
      where: {
        idChequeo_numeroItem: {
          idChequeo,
          numeroItem,
        },
      },
    });
  }

  async update(idChequeo, numeroItem, puntaje) {
    return await prisma.puntuacionItem.update({
      where: {
        idChequeo_numeroItem: {
          idChequeo,
          numeroItem,
        },
      },
      data: { puntaje },
    });
  }

  async deleteByChequeo(idChequeo) {
    return await prisma.puntuacionItem.deleteMany({
      where: { idChequeo },
    });
  }
}

module.exports = new PuntuacionItemRepository();

