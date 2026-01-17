const express = require('express');
const router = express.Router();
const entrenadorController = require('../controller/EntrenadorController');

// Obtener todos los entrenadores
router.get('/', entrenadorController.getAll);

// Obtener un entrenador por ID
router.get('/:id', entrenadorController.getById);

// Crear un nuevo entrenador
router.post('/', entrenadorController.create);

// Actualizar un entrenador
router.put('/:id', entrenadorController.update);

// Eliminar un entrenador
router.delete('/:id', entrenadorController.delete);

module.exports = router;
