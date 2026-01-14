const express = require('express');
const router = express.Router();
const { AdminController } = require('../controller');

/**
 * Rutas para Admin/Usuario del Sistema
 * Base path: /api/admin
 */

// Crear un nuevo administrador
router.post('/', AdminController.create.bind(AdminController));

// Obtener todos los administradores
router.get('/', AdminController.getAll.bind(AdminController));

// Obtener un administrador por ID
router.get('/:id', AdminController.getById.bind(AdminController));

// Actualizar un administrador
router.put('/:id', AdminController.update.bind(AdminController));

// Eliminar un administrador
router.delete('/:id', AdminController.delete.bind(AdminController));

module.exports = router;
