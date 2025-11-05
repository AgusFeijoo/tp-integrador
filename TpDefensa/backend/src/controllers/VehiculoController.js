const vehiculoService = require('../services/VehiculoService');

class VehiculoController {
  async crearVehiculo(req, res, next) {
    try {
      const { patente, marca, modelo, anio } = req.body;
      const idDuenio = req.user.id;

      const vehiculo = await vehiculoService.crearVehiculo(patente, marca, modelo, anio, idDuenio);

      res.status(201).json(vehiculo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMisVehiculos(req, res, next) {
    try {
      const idDuenio = req.user.id;

      const vehiculos = await vehiculoService.obtenerMisVehiculos(idDuenio);

      res.status(200).json(vehiculos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehiculoController();

