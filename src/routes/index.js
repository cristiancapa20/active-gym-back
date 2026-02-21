const express = require('express');
const gymRoutes = require('./gymRoutes');
const adminRoutes = require('./adminRoutes');
const clienteRoutes = require('./clienteRoutes');
const entrenadorRoutes = require('./entrenadorRoutes');
const planMembresiaRoutes = require('./planMembresiaRoutes');
const membresiaRoutes = require('./membresiaRoutes');
const qrRoutes = require('./qrRoutes');
const asistenciaRoutes = require('./asistenciaRoutes');
const authRoutes = require('./authRoutes');
const notificacionRoutes = require('./notificacionRoutes');
const configuracionRoutes = require('./configuracionRoutes');

const router = express.Router();

/**
 * Configuración de todas las rutas de la API
 * Todas las rutas tienen el prefijo /api
 */

// Rutas de Autenticación
router.use('/auth', authRoutes);

// Rutas de Gym
router.use('/gym', gymRoutes);

// Rutas de Admin
router.use('/admin', adminRoutes);

// Rutas de Cliente
router.use('/cliente', clienteRoutes);

// Rutas de Entrenador
router.use('/entrenador', entrenadorRoutes);

// Rutas de Plan de Membresía
router.use('/plan-membresia', planMembresiaRoutes);

// Rutas de Membresía
router.use('/membresia', membresiaRoutes);

// Rutas de QR
router.use('/qr', qrRoutes);

// Rutas de Asistencia
router.use('/asistencia', asistenciaRoutes);

// Rutas de Notificaciones
router.use('/notificacion', notificacionRoutes);

// Rutas de Configuración
router.use('/configuracion', configuracionRoutes);

module.exports = router;
