const { Asistencia, Cliente, QR } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller para Asistencia
 * CRUD completo para gestión de asistencias al gym
 */
class AsistenciaController {
  /**
   * Registrar una nueva asistencia (entrada)
   * POST /api/asistencia
   */
  async create(req, res) {
    try {
      const { clienteId, qrId, fechaEntrada } = req.body;

      // Validaciones básicas
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId es requerido'
        });
      }

      // Verificar que el cliente existe
      const cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const nuevaAsistencia = await Asistencia.create({
        clienteId,
        qrId: qrId || null,
        fechaEntrada: fechaEntrada ? new Date(fechaEntrada) : new Date(),
        fechaSalida: null
      });

      return res.status(201).json({
        success: true,
        message: 'Asistencia registrada exitosamente',
        data: nuevaAsistencia
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar asistencia'
      });
    }
  }

  /**
   * Obtener todas las asistencias
   * GET /api/asistencia
   */
  async getAll(req, res) {
    try {
      const { clienteId, fecha } = req.query;
      
      const where = {};
      if (clienteId) where.clienteId = clienteId;
      if (fecha) {
        const startDate = new Date(fecha);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(fecha);
        endDate.setHours(23, 59, 59, 999);
        where.fechaEntrada = {
          [Op.between]: [startDate, endDate]
        };
      }

      const asistencias = await Asistencia.findAll({
        where,
        include: [
          { model: Cliente, as: 'cliente' },
          { model: QR, as: 'qr', required: false }
        ],
        order: [['fechaEntrada', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Asistencias obtenidas exitosamente',
        data: asistencias
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener asistencias'
      });
    }
  }

  /**
   * Obtener una asistencia por ID
   * GET /api/asistencia/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const asistencia = await Asistencia.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: QR, as: 'qr', required: false }
        ]
      });

      if (!asistencia) {
        return res.status(404).json({
          success: false,
          message: 'Asistencia no encontrada'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Asistencia obtenida exitosamente',
        data: asistencia
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener asistencia'
      });
    }
  }

  /**
   * Actualizar una asistencia
   * PUT /api/asistencia/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { clienteId, qrId, fechaEntrada, fechaSalida } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const asistencia = await Asistencia.findByPk(id);
      
      if (!asistencia) {
        return res.status(404).json({
          success: false,
          message: 'Asistencia no encontrada'
        });
      }

      await asistencia.update({
        clienteId,
        qrId,
        fechaEntrada: fechaEntrada ? new Date(fechaEntrada) : asistencia.fechaEntrada,
        fechaSalida: fechaSalida ? new Date(fechaSalida) : asistencia.fechaSalida
      });
      
      return res.status(200).json({
        success: true,
        message: 'Asistencia actualizada exitosamente',
        data: asistencia
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar asistencia'
      });
    }
  }

  /**
   * Eliminar una asistencia
   * DELETE /api/asistencia/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const asistencia = await Asistencia.findByPk(id);
      
      if (!asistencia) {
        return res.status(404).json({
          success: false,
          message: 'Asistencia no encontrada'
        });
      }

      await asistencia.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Asistencia eliminada exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar asistencia'
      });
    }
  }

  /**
   * Registrar salida de un cliente
   * PUT /api/asistencia/:id/salida
   */
  async registrarSalida(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const asistencia = await Asistencia.findByPk(id);
      
      if (!asistencia) {
        return res.status(404).json({
          success: false,
          message: 'Asistencia no encontrada'
        });
      }
      
      if (asistencia.fechaSalida) {
        return res.status(400).json({
          success: false,
          message: 'La salida ya fue registrada'
        });
      }
      
      asistencia.fechaSalida = new Date();
      await asistencia.save();
      
      return res.status(200).json({
        success: true,
        message: 'Salida registrada exitosamente',
        data: asistencia
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar salida'
      });
    }
  }

  /**
   * Obtener asistencias de un cliente
   * GET /api/asistencia/cliente/:clienteId
   */
  async getByCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId es requerido'
        });
      }

      const asistencias = await Asistencia.findAndCountAll({
        where: { clienteId },
        include: [
          { model: QR, as: 'qr', required: false }
        ],
        order: [['fechaEntrada', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        message: 'Asistencias del cliente obtenidas exitosamente',
        data: asistencias.rows,
        total: asistencias.count
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener asistencias del cliente'
      });
    }
  }

  /**
   * Obtener clientes actualmente en el gym
   * GET /api/asistencia/activos
   */
  async getActivos(req, res) {
    try {
      const asistencias = await Asistencia.findAll({
        where: {
          fechaSalida: null
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: QR, as: 'qr', required: false }
        ],
        order: [['fechaEntrada', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Clientes activos obtenidos exitosamente',
        data: asistencias
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener clientes activos'
      });
    }
  }
}

module.exports = new AsistenciaController();
