const { evaluarReglas, ESTADO_SEGURO, ESTADO_RECHEQUEAR, CANTIDAD_ITEMS_REQUERIDOS } = require('../src/services/EvaluadorReglas');

describe('EvaluadorReglas', () => {
  describe('Caso 1: Total 80, todos los ítems >= 5', () => {
    test('debe retornar SEGURO y no requerir observación', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 10];
      const resultado = evaluarReglas(puntuaciones);

      expect(resultado.estadoResultado).toBe(ESTADO_SEGURO);
      expect(resultado.requiereObservacion).toBe(false);
      expect(resultado.total).toBe(80);
    });
  });

  describe('Caso 2: Hay un ítem con valor < 5', () => {
    test('debe retornar RECHEQUEAR aunque el total sea alto', () => {
      const puntuaciones = [5, 5, 5, 5, 5, 5, 5, 4];
      const resultado = evaluarReglas(puntuaciones);

      expect(resultado.estadoResultado).toBe(ESTADO_RECHEQUEAR);
      expect(resultado.total).toBe(39);
    });
  });

  describe('Caso 3: Total < 40', () => {
    test('debe retornar RECHEQUEAR y requerir observación', () => {
      const puntuaciones = [3, 4, 5, 4, 5, 5, 4, 5];
      const observacion = 'Observación requerida';

      const resultado = evaluarReglas(puntuaciones, observacion);

      expect(resultado.estadoResultado).toBe(ESTADO_RECHEQUEAR);
      expect(resultado.requiereObservacion).toBe(true);
      expect(resultado.total).toBe(35);
    });

    test('debe lanzar error si total < 40 y no hay observación', () => {
      const puntuaciones = [3, 4, 5, 4, 5, 5, 4, 5];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow('La observación es obligatoria cuando el total es menor a 40');
    });
  });

  describe('Validaciones de cantidad de ítems', () => {
    test('debe lanzar error si hay menos de 8 ítems', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow(`Debe haber exactamente ${CANTIDAD_ITEMS_REQUERIDOS} ítems`);
    });

    test('debe lanzar error si hay más de 8 ítems', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 10, 10];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow(`Debe haber exactamente ${CANTIDAD_ITEMS_REQUERIDOS} ítems`);
    });

    test('debe lanzar error si no es un array', () => {
      expect(() => {
        evaluarReglas('no es un array');
      }).toThrow('Las puntuaciones deben ser un array');
    });
  });

  describe('Validaciones de rango de puntajes', () => {
    test('debe lanzar error si algún ítem es menor a 1', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 0];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow('El ítem 8 debe estar entre 1 y 10');
    });

    test('debe lanzar error si algún ítem es mayor a 10', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 11];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow('El ítem 8 debe estar entre 1 y 10');
    });

    test('debe lanzar error si algún ítem no es un número', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 'no es numero'];

      expect(() => {
        evaluarReglas(puntuaciones);
      }).toThrow('El ítem 8 debe ser un número válido');
    });
  });

  describe('Casos adicionales', () => {
    test('total >= 80 pero con ítem < 5 debe ser RECHEQUEAR', () => {
      const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 4];
      const resultado = evaluarReglas(puntuaciones);

      expect(resultado.estadoResultado).toBe(ESTADO_RECHEQUEAR);
      expect(resultado.total).toBe(84);
    });

    test('total entre 40 y 79 sin ítems < 5 debe ser RECHEQUEAR', () => {
      const puntuaciones = [5, 5, 5, 5, 5, 5, 5, 5];
      const resultado = evaluarReglas(puntuaciones);

      expect(resultado.estadoResultado).toBe(ESTADO_RECHEQUEAR);
      expect(resultado.total).toBe(40);
    });
  });
});

