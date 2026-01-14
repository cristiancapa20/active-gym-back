const express = require('express');
const router = express.Router();
const { MembresiaController } = require('../controller');

/**
 * Rutas para Membresía
 * Base path: /api/membresia
 */

// Crear una nueva membresía
router.post('/', MembresiaController.create.bind(MembresiaController));

// Obtener todas las membresías (con filtro opcional por clienteId en query)
router.get('/', MembresiaController.getAll.bind(MembresiaController));

// Obtener membresías activas de un cliente
router.get('/cliente/:clienteId/activas', MembresiaController.getActivasByCliente.bind(MembresiaController));

// Obtener una membresía por ID
router.get('/:id', MembresiaController.getById.bind(MembresiaController));

// Actualizar una membresía
router.put('/:id', MembresiaController.update.bind(MembresiaController));

// Eliminar una membresía
router.delete('/:id', MembresiaController.delete.bind(MembresiaController));

module.exports = router;
