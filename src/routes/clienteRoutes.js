const express = require('express');
const router = express.Router();
const { ClienteController } = require('../controller');

/**
 * Rutas para Cliente
 * Base path: /api/cliente
 */

// Crear un nuevo cliente
router.post('/', ClienteController.create.bind(ClienteController));

// Obtener todos los clientes
router.get('/', ClienteController.getAll.bind(ClienteController));

// Obtener un cliente por ID
router.get('/:id', ClienteController.getById.bind(ClienteController));

// Actualizar un cliente
router.put('/:id', ClienteController.update.bind(ClienteController));

// Eliminar un cliente
router.delete('/:id', ClienteController.delete.bind(ClienteController));

module.exports = router;
