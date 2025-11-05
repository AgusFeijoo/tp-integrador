const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/VehiculoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('DUENIO'), vehiculoController.crearVehiculo.bind(vehiculoController));

router.get('/mis-vehiculos', verificarToken, verificarRol('DUENIO'), vehiculoController.obtenerMisVehiculos.bind(vehiculoController));

module.exports = router;

