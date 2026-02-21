const express = require('express');
const router = express.Router();
const { PlanMembresiaController } = require('../controller');

/**
 * Rutas para Plan de Membresía
 * Base path: /api/plan-membresia
 */

// Crear un nuevo plan de membresía
router.post('/', PlanMembresiaController.create.bind(PlanMembresiaController));

// Obtener todos los planes de membresía (con filtro opcional por activo en query)
router.get('/', PlanMembresiaController.getAll.bind(PlanMembresiaController));

// Obtener un plan por ID
router.get('/:id', PlanMembresiaController.getById.bind(PlanMembresiaController));

// Actualizar un plan de membresía
router.put('/:id', PlanMembresiaController.update.bind(PlanMembresiaController));

// Eliminar un plan de membresía
router.delete('/:id', PlanMembresiaController.delete.bind(PlanMembresiaController));

module.exports = router;
