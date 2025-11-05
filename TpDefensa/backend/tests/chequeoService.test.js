const chequeoService = require('../src/services/ChequeoService');
const chequeoRepository = require('../src/repositories/ChequeoRepository');
const puntuacionItemRepository = require('../src/repositories/PuntuacionItemRepository');
const turnoRepository = require('../src/repositories/TurnoRepository');
const { CANTIDAD_ITEMS_REQUERIDOS } = require('../src/services/EvaluadorReglas');

jest.mock('../src/repositories/ChequeoRepository');
jest.mock('../src/repositories/PuntuacionItemRepository');
jest.mock('../src/repositories/TurnoRepository');

describe('ChequeoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('agregarItems', () => {
    test('debe lanzar error si el chequeo no existe', async () => {
      chequeoRepository.findById.mockResolvedValue(null);

      await expect(
        chequeoService.agregarItems('chequeo-id', [], 'inspector-id')
      ).rejects.toThrow('Chequeo no encontrado');
    });

    test('debe lanzar error si el inspector no es el dueño del chequeo', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'otro-inspector-id',
      });

      await expect(
        chequeoService.agregarItems('chequeo-id', [], 'inspector-id')
      ).rejects.toThrow('No tienes permisos para modificar este chequeo');
    });

    test('debe lanzar error si el chequeo ya está finalizado', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: 'SEGURO',
      });

      await expect(
        chequeoService.agregarItems('chequeo-id', [], 'inspector-id')
      ).rejects.toThrow('No se pueden modificar items de un chequeo finalizado');
    });

    test('debe lanzar error si se intentan agregar más de 8 ítems', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.countPuntuaciones.mockResolvedValue(5);

      const items = [
        { numeroItem: 6, puntaje: 8 },
        { numeroItem: 7, puntaje: 9 },
        { numeroItem: 8, puntaje: 10 },
        { numeroItem: 9, puntaje: 8 },
      ];

      await expect(
        chequeoService.agregarItems('chequeo-id', items, 'inspector-id')
      ).rejects.toThrow(`No se pueden agregar más de ${CANTIDAD_ITEMS_REQUERIDOS} ítems`);
    });

    test('debe lanzar error si algún ítem tiene puntaje fuera de rango 1-10', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.countPuntuaciones.mockResolvedValue(0);

      const items = [
        { numeroItem: 1, puntaje: 11 },
      ];

      await expect(
        chequeoService.agregarItems('chequeo-id', items, 'inspector-id')
      ).rejects.toThrow('El puntaje del ítem 1 debe estar entre 1 y 10');
    });

    test('debe lanzar error si algún ítem tiene número fuera de rango 1-8', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.countPuntuaciones.mockResolvedValue(0);

      const items = [
        { numeroItem: 9, puntaje: 8 },
      ];

      await expect(
        chequeoService.agregarItems('chequeo-id', items, 'inspector-id')
      ).rejects.toThrow(`El número de ítem 1 debe estar entre 1 y ${CANTIDAD_ITEMS_REQUERIDOS}`);
    });

    test('debe agregar items correctamente cuando todo es válido', async () => {
      const chequeoMock = {
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      };

      chequeoRepository.findById.mockResolvedValue(chequeoMock);
      chequeoRepository.countPuntuaciones.mockResolvedValue(0);
      chequeoRepository.findById.mockResolvedValueOnce(chequeoMock).mockResolvedValueOnce({
        ...chequeoMock,
        puntuaciones: [],
      });

      puntuacionItemRepository.createMany.mockResolvedValue({ count: 2 });

      const items = [
        { numeroItem: 1, puntaje: 8 },
        { numeroItem: 2, puntaje: 9 },
      ];

      await chequeoService.agregarItems('chequeo-id', items, 'inspector-id');

      expect(puntuacionItemRepository.createMany).toHaveBeenCalledWith([
        { idChequeo: 'chequeo-id', numeroItem: 1, puntaje: 8 },
        { idChequeo: 'chequeo-id', numeroItem: 2, puntaje: 9 },
      ]);
    });
  });

  describe('finalizarChequeo', () => {
    test('debe lanzar error si el chequeo no existe', async () => {
      chequeoRepository.findById.mockResolvedValue(null);

      await expect(
        chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id')
      ).rejects.toThrow('Chequeo no encontrado');
    });

    test('debe lanzar error si el inspector no es el dueño del chequeo', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'otro-inspector-id',
      });

      await expect(
        chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id')
      ).rejects.toThrow('No tienes permisos para finalizar este chequeo');
    });

    test('debe lanzar error si el chequeo ya está finalizado', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: 'SEGURO',
      });

      await expect(
        chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id')
      ).rejects.toThrow('El chequeo ya está finalizado');
    });

    test('debe lanzar error si no hay exactamente 8 ítems', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.getPuntuaciones.mockResolvedValue([
        { puntaje: 8 },
        { puntaje: 9 },
      ]);

      await expect(
        chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id')
      ).rejects.toThrow(`El chequeo debe tener exactamente ${CANTIDAD_ITEMS_REQUERIDOS} ítems para finalizar`);
    });

    test('debe lanzar error si total < 40 y no hay observación', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.getPuntuaciones.mockResolvedValue([
        { puntaje: 3 },
        { puntaje: 4 },
        { puntaje: 5 },
        { puntaje: 4 },
        { puntaje: 5 },
        { puntaje: 5 },
        { puntaje: 4 },
        { puntaje: 5 },
      ]);

      await expect(
        chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id')
      ).rejects.toThrow('La observación es obligatoria cuando el total es menor a 40');
    });

    test('debe finalizar chequeo correctamente con total >= 80', async () => {
      chequeoRepository.findById.mockResolvedValue({
        id: 'chequeo-id',
        idInspector: 'inspector-id',
        estadoResultado: null,
      });

      chequeoRepository.getPuntuaciones.mockResolvedValue([
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
        { puntaje: 10 },
      ]);

      chequeoRepository.update.mockResolvedValue({
        id: 'chequeo-id',
        estadoResultado: 'SEGURO',
        totalPuntaje: 80,
        observacion: null,
      });

      const resultado = await chequeoService.finalizarChequeo('chequeo-id', null, 'inspector-id');

      expect(chequeoRepository.update).toHaveBeenCalledWith('chequeo-id', {
        estadoResultado: 'SEGURO',
        totalPuntaje: 80,
        observacion: null,
      });

      expect(resultado.estadoResultado).toBe('SEGURO');
      expect(resultado.totalPuntaje).toBe(80);
    });
  });
});

