const turnoRepository = require('../repositories/TurnoRepository');
const vehiculoRepository = require('../repositories/VehiculoRepository');

class TurnoService {
  async obtenerDisponibilidad(fecha) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const turnosOcupados = await turnoRepository.findTurnosOcupadosPorFecha(fechaInicio, fechaFin);

    const horariosOcupados = turnosOcupados.map(t => {
      const fechaHora = new Date(t.fechaHora);
      return fechaHora.toISOString();
    });

    const horariosDisponibles = this.generarHorariosDisponibles(fechaInicio, horariosOcupados);

    return horariosDisponibles;
  }

  generarHorariosDisponibles(fecha, horariosOcupados) {
    const horarios = [];
    const horaInicio = 9;
    const horaFin = 17;
    const intervalo = 30;

    for (let hora = horaInicio; hora <= horaFin; hora++) {
      for (let minutos = 0; minutos < 60; minutos += intervalo) {
        if (hora === horaFin && minutos > 0) break;

        const horario = new Date(fecha);
        horario.setHours(hora, minutos, 0, 0);

        const horarioISO = horario.toISOString();
        if (!horariosOcupados.includes(horarioISO)) {
          horarios.push(horarioISO);
        }
      }
    }

    return horarios;
  }

  async crearTurno(idVehiculo, fechaHora, idDuenio) {
    const vehiculo = await vehiculoRepository.findById(idVehiculo);

    if (!vehiculo) {
      const error = new Error('Vehículo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (vehiculo.idDuenio !== idDuenio) {
      const error = new Error('No tienes permisos para crear turnos para este vehículo');
      error.statusCode = 403;
      throw error;
    }

    const fechaTurno = new Date(fechaHora);
    const ahora = new Date();

    if (fechaTurno <= ahora) {
      const error = new Error('La fecha del turno debe ser futura');
      error.statusCode = 400;
      throw error;
    }

    const disponibilidad = await this.obtenerDisponibilidad(fechaTurno);
    if (!disponibilidad.includes(fechaTurno.toISOString())) {
      const error = new Error('El horario seleccionado no está disponible');
      error.statusCode = 400;
      throw error;
    }

    const turno = await turnoRepository.create({
      idVehiculo,
      fechaHora: fechaTurno,
      estadoTurno: 'PENDIENTE',
    });

    return turno;
  }

  async confirmarTurno(idTurno, idUsuario, rolUsuario) {
    const turno = await turnoRepository.findById(idTurno);

    if (!turno) {
      const error = new Error('Turno no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (turno.estadoTurno === 'CONFIRMADO') {
      const error = new Error('El turno ya está confirmado');
      error.statusCode = 400;
      throw error;
    }

    if (turno.estadoTurno === 'CANCELADO') {
      const error = new Error('No se puede confirmar un turno cancelado');
      error.statusCode = 400;
      throw error;
    }

    if (turno.estadoTurno === 'COMPLETADO') {
      const error = new Error('No se puede confirmar un turno completado');
      error.statusCode = 400;
      throw error;
    }

    const fechaTurno = new Date(turno.fechaHora);
    const ahora = new Date();

    if (fechaTurno <= ahora) {
      const error = new Error('No se puede confirmar un turno en fecha pasada');
      error.statusCode = 400;
      throw error;
    }

    const turnoActualizado = await turnoRepository.update(idTurno, {
      estadoTurno: 'CONFIRMADO',
    });

    return turnoActualizado;
  }

  async obtenerMisTurnos(idDuenio) {
    return await turnoRepository.findTurnosByDuenio(idDuenio);
  }

  async obtenerTurnosPendientes() {
    return await turnoRepository.findTurnosPendientes();
  }

  async obtenerTurnosConfirmados() {
    return await turnoRepository.findTurnosConfirmados();
  }
}

module.exports = new TurnoService();

