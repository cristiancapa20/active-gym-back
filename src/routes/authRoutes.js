const express = require('express');
const router = express.Router();
const { AuthController } = require('../controller');

/**
 * Rutas de Autenticación
 * Base path: /api/auth
 */

// Login unificado (Admin y Cliente)
router.post('/login', AuthController.login.bind(AuthController));

// Registro de Admin (solo para crear otros admins)
router.post('/admin/register', AuthController.adminRegister.bind(AuthController));

module.exports = router;
