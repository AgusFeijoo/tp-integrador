const express = require('express');
const router = express.Router();
const chequeoController = require('../controllers/ChequeoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('INSPECTOR'), chequeoController.crearChequeo.bind(chequeoController));

router.get('/en-proceso', verificarToken, verificarRol('INSPECTOR', 'ADMIN'), chequeoController.obtenerChequeosEnProceso.bind(chequeoController));

router.get('/realizados', verificarToken, verificarRol('INSPECTOR', 'ADMIN'), chequeoController.obtenerChequeosRealizados.bind(chequeoController));

router.post('/:id/items', verificarToken, verificarRol('INSPECTOR'), chequeoController.agregarItems.bind(chequeoController));

router.post('/:id/finalizar', verificarToken, verificarRol('INSPECTOR'), chequeoController.finalizarChequeo.bind(chequeoController));

router.get('/:id', verificarToken, chequeoController.obtenerChequeo.bind(chequeoController));

module.exports = router;

