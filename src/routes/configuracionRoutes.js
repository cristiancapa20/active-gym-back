const express = require('express');
const router = express.Router();
const { ConfiguracionController } = require('../controller');

/**
 * Rutas para Configuraciones
 * Base path: /api/configuracion
 */

// Obtener todas las configuraciones de un gym (requiere gymId en query)
router.get('/', ConfiguracionController.getAll.bind(ConfiguracionController));

// Obtener una configuración por gymId y clave
router.get('/:gymId/:clave', ConfiguracionController.getByClave.bind(ConfiguracionController));

// Crear o actualizar una configuración (solo super_admin)
router.put('/:gymId/:clave', ConfiguracionController.upsert.bind(ConfiguracionController));

// Actualizar múltiples configuraciones (solo super_admin)
router.post('/:gymId/bulk-update', ConfiguracionController.bulkUpdate.bind(ConfiguracionController));

module.exports = router;
