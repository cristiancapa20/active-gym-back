const { Notificacion, Cliente, Membresia } = require('../models');
const { desactivarVencidos } = require('../utils/cronJobs');

/**
 * Controller para Notificaciones
 * Maneja las notificaciones del sistema
 */
class NotificacionController {
  /**
   * Obtener todas las notificaciones
   * GET /api/notificacion
   * Query params: leida (true/false), tipo, clienteId
   */
  async getAll(req, res) {
    try {
      const { leida, tipo, clienteId } = req.query;
      
      const where = {};
      if (leida !== undefined) {
        where.leida = leida === 'true';
      }
      if (tipo) {
        where.tipo = tipo;
      }
      if (clienteId) {
        where.clienteId = clienteId;
      }

      const notificaciones = await Notificacion.findAll({
        where,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'cedula'], required: false },
          { model: Membresia, as: 'membresia', attributes: ['id', 'tipo', 'fechaInicio', 'fechaFin'], required: false }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: notificaciones
      });
    } catch (error) {
      console.error('Error en getAll notificaciones:', error);
      // Si la tabla no existe, devolver array vacío en lugar de error
      if (error.name === 'SequelizeDatabaseError' || error.message.includes('does not exist')) {
        return res.status(200).json({
          success: true,
          message: 'Notificaciones obtenidas exitosamente',
          data: []
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener notificaciones'
      });
    }
  }

  /**
   * Obtener notificaciones no leídas
   * GET /api/notificacion/no-leidas
   */
  async getNoLeidas(req, res) {
    try {
      const notificaciones = await Notificacion.findAll({
        where: { leida: false },
        include: [
          { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'cedula'], required: false },
          { model: Membresia, as: 'membresia', attributes: ['id', 'tipo', 'fechaInicio', 'fechaFin'], required: false }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Notificaciones no leídas obtenidas exitosamente',
        data: notificaciones,
        count: notificaciones.length
      });
    } catch (error) {
      console.error('Error en getNoLeidas notificaciones:', error);
      // Si la tabla no existe, devolver array vacío
      if (error.name === 'SequelizeDatabaseError' || error.message.includes('does not exist')) {
        return res.status(200).json({
          success: true,
          message: 'Notificaciones no leídas obtenidas exitosamente',
          data: [],
          count: 0
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener notificaciones no leídas'
      });
    }
  }

  /**
   * Marcar notificación como leída
   * PUT /api/notificacion/:id/leer
   */
  async marcarComoLeida(req, res) {
    try {
      const { id } = req.params;

      const notificacion = await Notificacion.findByPk(id);
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      await notificacion.update({ leida: true });

      return res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notificacion
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al marcar notificación como leída'
      });
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PUT /api/notificacion/marcar-todas-leidas
   */
  async marcarTodasComoLeidas(req, res) {
    try {
      await Notificacion.update(
        { leida: true },
        { where: { leida: false } }
      );

      return res.status(200).json({
        success: true,
        message: 'Todas las notificaciones han sido marcadas como leídas'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al marcar notificaciones como leídas'
      });
    }
  }

  /**
   * Eliminar notificación
   * DELETE /api/notificacion/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const notificacion = await Notificacion.findByPk(id);
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      await notificacion.destroy();

      return res.status(200).json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar notificación'
      });
    }
  }

  /**
   * Ejecutar verificación manual de membresías por vencer
   * POST /api/notificacion/verificar-vencimientos
   * Este endpoint ejecuta la verificación y emite eventos Socket.io
   */
  async verificarVencimientos(req, res) {
    try {
      // Obtener el servidor Socket.io del contexto global
      const io = global.io;
      
      if (!io) {
        return res.status(500).json({
          success: false,
          message: 'Servidor Socket.io no disponible'
        });
      }

      // Ejecutar la verificación (esto creará notificaciones y emitirá eventos)
      await desactivarVencidos(io);

      return res.status(200).json({
        success: true,
        message: 'Verificación de vencimientos ejecutada exitosamente. Los eventos se han emitido vía Socket.io.'
      });
    } catch (error) {
      console.error('Error en verificarVencimientos:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al ejecutar verificación de vencimientos'
      });
    }
  }
}

module.exports = new NotificacionController();
