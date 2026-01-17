const express = require('express');
const router = express.Router();
const notificacionController = require('../controller/NotificacionController');

// Obtener todas las notificaciones
router.get('/', notificacionController.getAll);

// Obtener notificaciones no leídas
router.get('/no-leidas', notificacionController.getNoLeidas);

// Marcar notificación como leída
router.put('/:id/leer', notificacionController.marcarComoLeida);

// Marcar todas como leídas
router.put('/marcar-todas-leidas', notificacionController.marcarTodasComoLeidas);

// Eliminar notificación
router.delete('/:id', notificacionController.delete);

// Ejecutar verificación manual de vencimientos (para testing)
router.post('/verificar-vencimientos', notificacionController.verificarVencimientos);

module.exports = router;
