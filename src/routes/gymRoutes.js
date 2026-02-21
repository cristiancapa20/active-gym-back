const express = require('express');
const router = express.Router();
const { GymController } = require('../controller');

/**
 * Rutas para Gym
 * Base path: /api/gym
 */

// Crear un nuevo gimnasio (solo super_admin)
router.post('/', GymController.create.bind(GymController));

// Obtener todos los gimnasios (solo super_admin)
router.get('/', GymController.getAll.bind(GymController));

// Obtener un gimnasio por ID
router.get('/:id', GymController.getById.bind(GymController));

// Actualizar un gimnasio (solo super_admin)
router.put('/:id', GymController.update.bind(GymController));

// Eliminar un gimnasio (solo super_admin)
router.delete('/:id', GymController.delete.bind(GymController));

module.exports = router;
