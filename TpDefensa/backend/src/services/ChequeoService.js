const chequeoRepository = require('../repositories/ChequeoRepository');
const puntuacionItemRepository = require('../repositories/PuntuacionItemRepository');
const turnoRepository = require('../repositories/TurnoRepository');
const { evaluarReglas, CANTIDAD_ITEMS_REQUERIDOS } = require('./EvaluadorReglas');

class ChequeoService {
  async crearChequeo(idTurno, idInspector) {
    const turno = await turnoRepository.findById(idTurno);

    if (!turno) {
      const error = new Error('Turno no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (turno.estadoTurno !== 'CONFIRMADO') {
      const error = new Error('Solo se pueden crear chequeos para turnos confirmados');
      error.statusCode = 400;
      throw error;
    }

    const chequeoExistente = await chequeoRepository.findByTurnoId(idTurno);

    if (chequeoExistente) {
      const error = new Error('Ya existe un chequeo para este turno');
      error.statusCode = 409;
      throw error;
    }

    const chequeo = await chequeoRepository.create({
      idTurno,
      idInspector,
    });

    await turnoRepository.update(idTurno, {
      estadoTurno: 'COMPLETADO',
    });

    return chequeo;
  }

  async agregarItems(idChequeo, items, idInspector) {
    const chequeo = await chequeoRepository.findById(idChequeo);

    if (!chequeo) {
      const error = new Error('Chequeo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (chequeo.idInspector !== idInspector) {
      const error = new Error('No tienes permisos para modificar este chequeo');
      error.statusCode = 403;
      throw error;
    }

    if (chequeo.estadoResultado) {
      const error = new Error('No se pueden modificar items de un chequeo finalizado');
      error.statusCode = 400;
      throw error;
    }

    const cantidadActual = await chequeoRepository.countPuntuaciones(idChequeo);

    if (!Array.isArray(items)) {
      const error = new Error('Items debe ser un array');
      error.statusCode = 400;
      throw error;
    }

    if (cantidadActual + items.length > CANTIDAD_ITEMS_REQUERIDOS) {
      const error = new Error(`No se pueden agregar más de ${CANTIDAD_ITEMS_REQUERIDOS} ítems`);
      error.statusCode = 400;
      throw error;
    }

    items.forEach((item, index) => {
      if (typeof item.numeroItem !== 'number' || item.numeroItem < 1 || item.numeroItem > CANTIDAD_ITEMS_REQUERIDOS) {
        const error = new Error(`El número de ítem ${index + 1} debe estar entre 1 y ${CANTIDAD_ITEMS_REQUERIDOS}`);
        error.statusCode = 400;
        throw error;
      }

      if (typeof item.puntaje !== 'number' || item.puntaje < 1 || item.puntaje > 10) {
        const error = new Error(`El puntaje del ítem ${index + 1} debe estar entre 1 y 10`);
        error.statusCode = 400;
        throw error;
      }
    });

    const itemsParaCrear = items.map(item => ({
      idChequeo,
      numeroItem: item.numeroItem,
      puntaje: item.puntaje,
    }));

    await puntuacionItemRepository.createMany(itemsParaCrear);

    const chequeoActualizado = await chequeoRepository.findById(idChequeo);

    return chequeoActualizado;
  }

  async finalizarChequeo(idChequeo, observacion, idInspector) {
    const chequeo = await chequeoRepository.findById(idChequeo);

    if (!chequeo) {
      const error = new Error('Chequeo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (chequeo.idInspector !== idInspector) {
      const error = new Error('No tienes permisos para finalizar este chequeo');
      error.statusCode = 403;
      throw error;
    }

    if (chequeo.estadoResultado) {
      const error = new Error('El chequeo ya está finalizado');
      error.statusCode = 400;
      throw error;
    }

    const puntuaciones = await chequeoRepository.getPuntuaciones(idChequeo);

    if (puntuaciones.length !== CANTIDAD_ITEMS_REQUERIDOS) {
      const error = new Error(`El chequeo debe tener exactamente ${CANTIDAD_ITEMS_REQUERIDOS} ítems para finalizar`);
      error.statusCode = 400;
      throw error;
    }

    const puntajes = puntuaciones.map(p => p.puntaje);

    const resultado = evaluarReglas(puntajes, observacion);

    const chequeoActualizado = await chequeoRepository.update(idChequeo, {
      estadoResultado: resultado.estadoResultado,
      totalPuntaje: resultado.total,
      observacion: resultado.requiereObservacion ? observacion : (observacion || null),
    });

    return chequeoActualizado;
  }

  async obtenerChequeo(idChequeo, idUsuario, rolUsuario) {
    const chequeo = await chequeoRepository.findById(idChequeo);

    if (!chequeo) {
      const error = new Error('Chequeo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const esDuenio = chequeo.turno.vehiculo.idDuenio === idUsuario;
    const esInspector = chequeo.idInspector === idUsuario;
    const esAdmin = rolUsuario === 'ADMIN';

    if (!esDuenio && !esInspector && !esAdmin) {
      const error = new Error('No tienes permisos para ver este chequeo');
      error.statusCode = 403;
      throw error;
    }

    return chequeo;
  }

  async obtenerChequeosEnProceso(idInspector) {
    return await chequeoRepository.findChequeosEnProceso(idInspector);
  }

  async obtenerChequeosRealizados(idInspector) {
    return await chequeoRepository.findChequeosRealizados(idInspector);
  }
}

module.exports = new ChequeoService();

