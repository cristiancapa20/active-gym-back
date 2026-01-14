const express = require('express');
const router = express.Router();
const { QRController } = require('../controller');

/**
 * Rutas para QR
 * Base path: /api/qr
 */

// Validar un código QR (debe ir antes de /:id para evitar conflictos)
router.post('/validar', QRController.validar.bind(QRController));

// Obtener QR por código (debe ir antes de /:id)
router.get('/codigo/:codigo', QRController.getByCodigo.bind(QRController));

// Crear un nuevo código QR
router.post('/', QRController.create.bind(QRController));

// Obtener todos los códigos QR (con filtros opcionales en query: clienteId, membresiaId)
router.get('/', QRController.getAll.bind(QRController));

// Obtener un código QR por ID
router.get('/:id', QRController.getById.bind(QRController));

// Actualizar un código QR
router.put('/:id', QRController.update.bind(QRController));

// Eliminar un código QR
router.delete('/:id', QRController.delete.bind(QRController));

module.exports = router;
