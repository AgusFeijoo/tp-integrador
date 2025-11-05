const turnoService = require('../services/TurnoService');

class TurnoController {
  async obtenerDisponibilidad(req, res, next) {
    try {
      const { fecha } = req.query;

      if (!fecha) {
        return res.status(400).json({ error: 'La fecha es requerida' });
      }

      const horarios = await turnoService.obtenerDisponibilidad(fecha);

      res.status(200).json({ fecha, horariosDisponibles: horarios });
    } catch (error) {
      next(error);
    }
  }

  async crearTurno(req, res, next) {
    try {
      const { idVehiculo, fechaHora } = req.body;
      const idDuenio = req.user.id;

      if (!idVehiculo || !fechaHora) {
        return res.status(400).json({ error: 'idVehiculo y fechaHora son requeridos' });
      }

      const turno = await turnoService.crearTurno(idVehiculo, fechaHora, idDuenio);

      res.status(201).json(turno);
    } catch (error) {
      next(error);
    }
  }

  async confirmarTurno(req, res, next) {
    try {
      const { id } = req.params;
      const idUsuario = req.user.id;
      const rolUsuario = req.user.rol;

      const turno = await turnoService.confirmarTurno(id, idUsuario, rolUsuario);

      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMisTurnos(req, res, next) {
    try {
      const idDuenio = req.user.id;

      const turnos = await turnoService.obtenerMisTurnos(idDuenio);

      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerTurnosPendientes(req, res, next) {
    try {
      const turnos = await turnoService.obtenerTurnosPendientes();

      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerTurnosConfirmados(req, res, next) {
    try {
      const turnos = await turnoService.obtenerTurnosConfirmados();

      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TurnoController();

