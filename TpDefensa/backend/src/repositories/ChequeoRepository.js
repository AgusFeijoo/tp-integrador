const { prisma } = require('../config/db');

class ChequeoRepository {
  async findById(id) {
    return await prisma.chequeo.findUnique({
      where: { id },
      include: {
        turno: {
          include: {
            vehiculo: {
              include: {
                duenio: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        inspector: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        puntuaciones: {
          orderBy: {
            numeroItem: 'asc',
          },
        },
      },
    });
  }

  async findByTurnoId(idTurno) {
    return await prisma.chequeo.findUnique({
      where: { idTurno },
      include: {
        puntuaciones: {
          orderBy: {
            numeroItem: 'asc',
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.chequeo.create({
      data,
      include: {
        turno: {
          include: {
            vehiculo: {
              include: {
                duenio: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        inspector: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return await prisma.chequeo.update({
      where: { id },
      data,
      include: {
        puntuaciones: {
          orderBy: {
            numeroItem: 'asc',
          },
        },
      },
    });
  }

  async countPuntuaciones(idChequeo) {
    return await prisma.puntuacionItem.count({
      where: { idChequeo },
    });
  }

  async getPuntuaciones(idChequeo) {
    return await prisma.puntuacionItem.findMany({
      where: { idChequeo },
      orderBy: {
        numeroItem: 'asc',
      },
    });
  }

  async findChequeosEnProceso(idInspector) {
    return await prisma.chequeo.findMany({
      where: {
        idInspector,
        estadoResultado: null,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
      include: {
        turno: {
          include: {
            vehiculo: {
              select: {
                patente: true,
                marca: true,
                modelo: true,
              },
            },
          },
        },
        puntuaciones: {
          orderBy: {
            numeroItem: 'asc',
          },
        },
      },
    });
  }

  async findChequeosRealizados(idInspector) {
    return await prisma.chequeo.findMany({
      where: {
        idInspector,
        estadoResultado: {
          not: null,
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
      include: {
        turno: {
          include: {
            vehiculo: {
              select: {
                patente: true,
                marca: true,
                modelo: true,
                duenio: {
                  select: {
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        puntuaciones: {
          orderBy: {
            numeroItem: 'asc',
          },
        },
      },
    });
  }
}

module.exports = new ChequeoRepository();

