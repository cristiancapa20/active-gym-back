const express = require('express');
const adminRoutes = require('./adminRoutes');
const clienteRoutes = require('./clienteRoutes');
const membresiaRoutes = require('./membresiaRoutes');
const qrRoutes = require('./qrRoutes');
const asistenciaRoutes = require('./asistenciaRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

/**
 * Configuración de todas las rutas de la API
 * Todas las rutas tienen el prefijo /api
 */

// Rutas de Autenticación
router.use('/auth', authRoutes);

// Rutas de Admin
router.use('/admin', adminRoutes);

// Rutas de Cliente
router.use('/cliente', clienteRoutes);

// Rutas de Membresía
router.use('/membresia', membresiaRoutes);

// Rutas de QR
router.use('/qr', qrRoutes);

// Rutas de Asistencia
router.use('/asistencia', asistenciaRoutes);

module.exports = router;
