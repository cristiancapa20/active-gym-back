const express = require('express');
const router = express.Router();
const { AsistenciaController } = require('../controller');

/**
 * Rutas para Asistencia
 * Base path: /api/asistencia
 */

// Obtener clientes actualmente en el gym (debe ir antes de /:id)
router.get('/activos', AsistenciaController.getActivos.bind(AsistenciaController));

// Obtener asistencias de un cliente específico (debe ir antes de /:id)
router.get('/cliente/:clienteId', AsistenciaController.getByCliente.bind(AsistenciaController));

// Registrar salida de un cliente (debe ir antes de /:id)
router.put('/:id/salida', AsistenciaController.registrarSalida.bind(AsistenciaController));

// Registrar una nueva asistencia (entrada)
router.post('/', AsistenciaController.create.bind(AsistenciaController));

// Obtener todas las asistencias (con filtros opcionales en query: clienteId, fecha)
router.get('/', AsistenciaController.getAll.bind(AsistenciaController));

// Obtener una asistencia por ID
router.get('/:id', AsistenciaController.getById.bind(AsistenciaController));

// Actualizar una asistencia
router.put('/:id', AsistenciaController.update.bind(AsistenciaController));

// Eliminar una asistencia
router.delete('/:id', AsistenciaController.delete.bind(AsistenciaController));

module.exports = router;
