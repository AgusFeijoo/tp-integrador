const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/TurnoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.get('/disponibilidad', verificarToken, turnoController.obtenerDisponibilidad.bind(turnoController));

router.post('/', verificarToken, verificarRol('DUENIO'), turnoController.crearTurno.bind(turnoController));

router.post('/:id/confirmar', verificarToken, verificarRol('INSPECTOR', 'ADMIN'), turnoController.confirmarTurno.bind(turnoController));

router.get('/mis-turnos', verificarToken, verificarRol('DUENIO'), turnoController.obtenerMisTurnos.bind(turnoController));

router.get('/pendientes', verificarToken, verificarRol('INSPECTOR', 'ADMIN'), turnoController.obtenerTurnosPendientes.bind(turnoController));

router.get('/confirmados', verificarToken, verificarRol('INSPECTOR', 'ADMIN'), turnoController.obtenerTurnosConfirmados.bind(turnoController));

module.exports = router;

