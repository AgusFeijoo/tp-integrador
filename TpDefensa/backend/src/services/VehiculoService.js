const vehiculoRepository = require('../repositories/VehiculoRepository');

class VehiculoService {
  async crearVehiculo(patente, marca, modelo, anio, idDuenio) {
    if (!patente || !marca || !modelo || !anio) {
      const error = new Error('Todos los campos son requeridos');
      error.statusCode = 400;
      throw error;
    }

    if (anio < 1900 || anio > new Date().getFullYear() + 1) {
      const error = new Error('El año debe ser válido');
      error.statusCode = 400;
      throw error;
    }

    const vehiculoExistente = await vehiculoRepository.findByPatente(patente.toUpperCase());

    if (vehiculoExistente) {
      const error = new Error('Ya existe un vehículo con esta patente');
      error.statusCode = 409;
      throw error;
    }

    const vehiculo = await vehiculoRepository.create({
      patente: patente.toUpperCase(),
      marca,
      modelo,
      anio,
      idDuenio,
    });

    return vehiculo;
  }

  async obtenerMisVehiculos(idDuenio) {
    return await vehiculoRepository.findByDuenio(idDuenio);
  }
}

module.exports = new VehiculoService();

