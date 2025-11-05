const turnoService = require('../src/services/TurnoService');
const turnoRepository = require('../src/repositories/TurnoRepository');
const vehiculoRepository = require('../src/repositories/VehiculoRepository');

jest.mock('../src/repositories/TurnoRepository');
jest.mock('../src/repositories/VehiculoRepository');

describe('TurnoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('obtenerDisponibilidad', () => {
    test('no debe devolver horarios ocupados por turnos confirmados', async () => {
      const fecha = new Date('2024-12-20');
      fecha.setHours(0, 0, 0, 0);

      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      const turnosOcupados = [
        { fechaHora: new Date('2024-12-20T10:00:00Z') },
        { fechaHora: new Date('2024-12-20T14:30:00Z') },
      ];

      turnoRepository.findTurnosOcupadosPorFecha.mockResolvedValue(turnosOcupados);

      const horarios = await turnoService.obtenerDisponibilidad('2024-12-20');

      expect(horarios).not.toContain('2024-12-20T10:00:00.000Z');
      expect(horarios).not.toContain('2024-12-20T14:30:00.000Z');
      expect(horarios.length).toBeGreaterThan(0);
    });

    test('debe devolver horarios disponibles para una fecha', async () => {
      turnoRepository.findTurnosOcupadosPorFecha.mockResolvedValue([]);

      const horarios = await turnoService.obtenerDisponibilidad('2024-12-20');

      expect(Array.isArray(horarios)).toBe(true);
      expect(horarios.length).toBeGreaterThan(0);
    });
  });

  describe('crearTurno', () => {
    test('debe crear turno con estado PENDIENTE', async () => {
      const vehiculoMock = {
        id: 'vehiculo-id',
        idDuenio: 'duenio-id',
        patente: 'ABC123',
        marca: 'Toyota',
        modelo: 'Corolla',
      };

      vehiculoRepository.findById.mockResolvedValue(vehiculoMock);

      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);
      fechaFutura.setHours(10, 0, 0, 0);

      turnoRepository.findTurnosOcupadosPorFecha.mockResolvedValue([]);
      turnoRepository.create.mockResolvedValue({
        id: 'turno-id',
        idVehiculo: 'vehiculo-id',
        fechaHora: fechaFutura,
        estadoTurno: 'PENDIENTE',
      });

      const turno = await turnoService.crearTurno(
        'vehiculo-id',
        fechaFutura.toISOString(),
        'duenio-id'
      );

      expect(turno.estadoTurno).toBe('PENDIENTE');
      expect(turnoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          idVehiculo: 'vehiculo-id',
          estadoTurno: 'PENDIENTE',
        })
      );
    });

    test('debe lanzar error si el vehículo no existe', async () => {
      vehiculoRepository.findById.mockResolvedValue(null);

      await expect(
        turnoService.crearTurno('vehiculo-id', new Date().toISOString(), 'duenio-id')
      ).rejects.toThrow('Vehículo no encontrado');
    });

    test('debe lanzar error si el vehículo no pertenece al dueño', async () => {
      const vehiculoMock = {
        id: 'vehiculo-id',
        idDuenio: 'otro-duenio-id',
      };

      vehiculoRepository.findById.mockResolvedValue(vehiculoMock);

      await expect(
        turnoService.crearTurno('vehiculo-id', new Date().toISOString(), 'duenio-id')
      ).rejects.toThrow('No tienes permisos para crear turnos para este vehículo');
    });

    test('debe lanzar error si la fecha es pasada', async () => {
      const vehiculoMock = {
        id: 'vehiculo-id',
        idDuenio: 'duenio-id',
      };

      vehiculoRepository.findById.mockResolvedValue(vehiculoMock);

      const fechaPasada = new Date('2020-01-01');

      await expect(
        turnoService.crearTurno('vehiculo-id', fechaPasada.toISOString(), 'duenio-id')
      ).rejects.toThrow('La fecha del turno debe ser futura');
    });

    test('debe lanzar error si el horario no está disponible', async () => {
      const vehiculoMock = {
        id: 'vehiculo-id',
        idDuenio: 'duenio-id',
      };

      vehiculoRepository.findById.mockResolvedValue(vehiculoMock);

      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);
      fechaFutura.setHours(10, 0, 0, 0);

      const turnosOcupados = [{ fechaHora: fechaFutura }];
      turnoRepository.findTurnosOcupadosPorFecha.mockResolvedValue(turnosOcupados);

      await expect(
        turnoService.crearTurno('vehiculo-id', fechaFutura.toISOString(), 'duenio-id')
      ).rejects.toThrow('El horario seleccionado no está disponible');
    });
  });

  describe('confirmarTurno', () => {
    test('no debe permitir confirmar un turno ya confirmado', async () => {
      const turnoMock = {
        id: 'turno-id',
        estadoTurno: 'CONFIRMADO',
        fechaHora: new Date('2024-12-25'),
      };

      turnoRepository.findById.mockResolvedValue(turnoMock);

      await expect(
        turnoService.confirmarTurno('turno-id', 'usuario-id', 'INSPECTOR')
      ).rejects.toThrow('El turno ya está confirmado');
    });

    test('no debe permitir confirmar un turno cancelado', async () => {
      const turnoMock = {
        id: 'turno-id',
        estadoTurno: 'CANCELADO',
        fechaHora: new Date('2024-12-25'),
      };

      turnoRepository.findById.mockResolvedValue(turnoMock);

      await expect(
        turnoService.confirmarTurno('turno-id', 'usuario-id', 'INSPECTOR')
      ).rejects.toThrow('No se puede confirmar un turno cancelado');
    });

    test('no debe permitir confirmar un turno completado', async () => {
      const turnoMock = {
        id: 'turno-id',
        estadoTurno: 'COMPLETADO',
        fechaHora: new Date('2024-12-25'),
      };

      turnoRepository.findById.mockResolvedValue(turnoMock);

      await expect(
        turnoService.confirmarTurno('turno-id', 'usuario-id', 'INSPECTOR')
      ).rejects.toThrow('No se puede confirmar un turno completado');
    });

    test('no debe permitir confirmar turnos en fechas pasadas', async () => {
      const fechaPasada = new Date('2020-01-01');
      const turnoMock = {
        id: 'turno-id',
        estadoTurno: 'PENDIENTE',
        fechaHora: fechaPasada,
      };

      turnoRepository.findById.mockResolvedValue(turnoMock);

      await expect(
        turnoService.confirmarTurno('turno-id', 'usuario-id', 'INSPECTOR')
      ).rejects.toThrow('No se puede confirmar un turno en fecha pasada');
    });

    test('debe confirmar turno correctamente', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);

      const turnoMock = {
        id: 'turno-id',
        estadoTurno: 'PENDIENTE',
        fechaHora: fechaFutura,
      };

      turnoRepository.findById.mockResolvedValue(turnoMock);
      turnoRepository.update.mockResolvedValue({
        ...turnoMock,
        estadoTurno: 'CONFIRMADO',
      });

      const resultado = await turnoService.confirmarTurno('turno-id', 'usuario-id', 'INSPECTOR');

      expect(resultado.estadoTurno).toBe('CONFIRMADO');
      expect(turnoRepository.update).toHaveBeenCalledWith('turno-id', {
        estadoTurno: 'CONFIRMADO',
      });
    });
  });
});

