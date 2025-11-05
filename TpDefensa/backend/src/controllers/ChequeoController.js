const chequeoService = require('../services/ChequeoService');

class ChequeoController {
  async crearChequeo(req, res, next) {
    try {
      const { idTurno } = req.body;
      const idInspector = req.user.id;

      if (!idTurno) {
        return res.status(400).json({ error: 'idTurno es requerido' });
      }

      const chequeo = await chequeoService.crearChequeo(idTurno, idInspector);

      res.status(201).json(chequeo);
    } catch (error) {
      next(error);
    }
  }

  async agregarItems(req, res, next) {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const idInspector = req.user.id;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items debe ser un array no vacío' });
      }

      const chequeo = await chequeoService.agregarItems(id, items, idInspector);

      res.status(200).json(chequeo);
    } catch (error) {
      next(error);
    }
  }

  async finalizarChequeo(req, res, next) {
    try {
      const { id } = req.params;
      const { observacion } = req.body;
      const idInspector = req.user.id;

      const chequeo = await chequeoService.finalizarChequeo(id, observacion || null, idInspector);

      res.status(200).json(chequeo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerChequeo(req, res, next) {
    try {
      const { id } = req.params;
      const idUsuario = req.user.id;
      const rolUsuario = req.user.rol;

      const chequeo = await chequeoService.obtenerChequeo(id, idUsuario, rolUsuario);

      res.status(200).json(chequeo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerChequeosEnProceso(req, res, next) {
    try {
      const idInspector = req.user.id;

      const chequeos = await chequeoService.obtenerChequeosEnProceso(idInspector);

      res.status(200).json(chequeos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerChequeosRealizados(req, res, next) {
    try {
      const idInspector = req.user.id;

      const chequeos = await chequeoService.obtenerChequeosRealizados(idInspector);

      res.status(200).json(chequeos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChequeoController();

