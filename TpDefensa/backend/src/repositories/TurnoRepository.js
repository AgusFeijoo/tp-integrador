const { prisma } = require('../config/db');

class TurnoRepository {
  async findById(id) {
    return await prisma.turno.findUnique({
      where: { id },
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
        chequeo: {
          include: {
            inspector: {
              select: {
                id: true,
                nombre: true,
              },
            },
            puntuaciones: {
              orderBy: {
                numeroItem: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.turno.create({
      data,
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
    });
  }

  async update(id, data) {
    return await prisma.turno.update({
      where: { id },
      data,
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
    });
  }

  async findTurnosOcupadosPorFecha(fechaInicio, fechaFin) {
    return await prisma.turno.findMany({
      where: {
        fechaHora: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estadoTurno: {
          in: ['CONFIRMADO', 'COMPLETADO'],
        },
      },
      select: {
        fechaHora: true,
      },
    });
  }

  async findTurnosByVehiculo(idVehiculo) {
    return await prisma.turno.findMany({
      where: { idVehiculo },
      orderBy: {
        fechaHora: 'desc',
      },
      include: {
        chequeo: {
          select: {
            id: true,
            estadoResultado: true,
            totalPuntaje: true,
            fechaCreacion: true,
          },
        },
      },
    });
  }

  async findTurnosByDuenio(idDuenio) {
    return await prisma.turno.findMany({
      where: {
        vehiculo: {
          idDuenio,
        },
      },
      orderBy: {
        fechaHora: 'desc',
      },
      include: {
        vehiculo: {
          select: {
            id: true,
            patente: true,
            marca: true,
            modelo: true,
          },
        },
        chequeo: {
          select: {
            id: true,
            estadoResultado: true,
            totalPuntaje: true,
            fechaCreacion: true,
          },
        },
      },
    });
  }

  async findTurnosPendientes() {
    return await prisma.turno.findMany({
      where: {
        estadoTurno: 'PENDIENTE',
      },
      orderBy: {
        fechaHora: 'asc',
      },
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
    });
  }

  async findTurnosConfirmados() {
    return await prisma.turno.findMany({
      where: {
        estadoTurno: 'CONFIRMADO',
      },
      orderBy: {
        fechaHora: 'asc',
      },
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
        chequeo: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}

module.exports = new TurnoRepository();

