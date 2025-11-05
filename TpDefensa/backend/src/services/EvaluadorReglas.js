const ESTADO_SEGURO = 'SEGURO';
const ESTADO_RECHEQUEAR = 'RECHEQUEAR';
const TOTAL_MINIMO_SEGURO = 80;
const TOTAL_MINIMO_OBSERVACION = 40;
const PUNTAJE_MINIMO_ITEM = 5;
const CANTIDAD_ITEMS_REQUERIDOS = 8;
const PUNTAJE_MIN = 1;
const PUNTAJE_MAX = 10;

function evaluarReglas(puntuaciones, observacion = null) {
  if (!Array.isArray(puntuaciones)) {
    throw new Error('Las puntuaciones deben ser un array');
  }

  if (puntuaciones.length !== CANTIDAD_ITEMS_REQUERIDOS) {
    throw new Error(`Debe haber exactamente ${CANTIDAD_ITEMS_REQUERIDOS} ítems`);
  }

  puntuaciones.forEach((puntaje, index) => {
    if (typeof puntaje !== 'number' || isNaN(puntaje)) {
      throw new Error(`El ítem ${index + 1} debe ser un número válido`);
    }
    if (puntaje < PUNTAJE_MIN || puntaje > PUNTAJE_MAX) {
      throw new Error(`El ítem ${index + 1} debe estar entre ${PUNTAJE_MIN} y ${PUNTAJE_MAX}`);
    }
  });

  const total = puntuaciones.reduce((suma, puntaje) => suma + puntaje, 0);
  const tieneItemBajo = puntuaciones.some(p => p < PUNTAJE_MINIMO_ITEM);

  let estadoResultado;
  let requiereObservacion = false;

  if (total < TOTAL_MINIMO_OBSERVACION) {
    estadoResultado = ESTADO_RECHEQUEAR;
    requiereObservacion = true;
  } else if (tieneItemBajo) {
    estadoResultado = ESTADO_RECHEQUEAR;
  } else if (total >= TOTAL_MINIMO_SEGURO && !tieneItemBajo) {
    estadoResultado = ESTADO_SEGURO;
  } else {
    estadoResultado = ESTADO_RECHEQUEAR;
  }

  if (requiereObservacion && (!observacion || observacion.trim() === '')) {
    throw new Error('La observación es obligatoria cuando el total es menor a 40');
  }

  return {
    estadoResultado,
    requiereObservacion,
    total,
  };
}

module.exports = {
  evaluarReglas,
  ESTADO_SEGURO,
  ESTADO_RECHEQUEAR,
  CANTIDAD_ITEMS_REQUERIDOS,
};

