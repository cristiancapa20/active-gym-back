const { Membresia, Cliente } = require('../models');

/**
 * Controller para Membresía
 * CRUD completo para gestión de membresías
 */
class MembresiaController {
  /**
   * Crear una nueva membresía
   * POST /api/membresia
   */
  async create(req, res) {
    try {
      const { clienteId, tipo, fechaInicio, fechaFin, activa, precio } = req.body;

      // Validaciones básicas
      if (!clienteId || !tipo || precio === undefined) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId, tipo y precio son requeridos'
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

      const membresia = await Membresia.create({
        clienteId,
        tipo,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        activa: activa !== undefined ? activa : true,
        precio
      });

      return res.status(201).json({
        success: true,
        message: 'Membresía creada exitosamente',
        data: membresia
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear membresía'
      });
    }
  }

  /**
   * Obtener todas las membresías
   * GET /api/membresia
   */
  async getAll(req, res) {
    try {
      const { clienteId } = req.query;
      
      const where = {};
      if (clienteId) {
        where.clienteId = clienteId;
      }

      const membresias = await Membresia.findAll({
        where,
        include: [{ model: Cliente, as: 'cliente' }],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Membresías obtenidas exitosamente',
        data: membresias
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener membresías'
      });
    }
  }

  /**
   * Obtener una membresía por ID
   * GET /api/membresia/:id
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

      const membresia = await Membresia.findByPk(id, {
        include: [{ model: Cliente, as: 'cliente' }]
      });

      if (!membresia) {
        return res.status(404).json({
          success: false,
          message: 'Membresía no encontrada'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Membresía obtenida exitosamente',
        data: membresia
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener membresía'
      });
    }
  }

  /**
   * Actualizar una membresía
   * PUT /api/membresia/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { clienteId, tipo, fechaInicio, fechaFin, activa, precio } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const membresia = await Membresia.findByPk(id);
      
      if (!membresia) {
        return res.status(404).json({
          success: false,
          message: 'Membresía no encontrada'
        });
      }

      await membresia.update({
        clienteId,
        tipo,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : membresia.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : membresia.fechaFin,
        activa,
        precio
      });
      
      return res.status(200).json({
        success: true,
        message: 'Membresía actualizada exitosamente',
        data: membresia
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar membresía'
      });
    }
  }

  /**
   * Eliminar una membresía
   * DELETE /api/membresia/:id
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

      const membresia = await Membresia.findByPk(id);
      
      if (!membresia) {
        return res.status(404).json({
          success: false,
          message: 'Membresía no encontrada'
        });
      }

      await membresia.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Membresía eliminada exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar membresía'
      });
    }
  }

  /**
   * Obtener membresías activas de un cliente
   * GET /api/membresia/cliente/:clienteId/activas
   */
  async getActivasByCliente(req, res) {
    try {
      const { clienteId } = req.params;

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId es requerido'
        });
      }

      const membresias = await Membresia.findAll({
        where: {
          clienteId,
          activa: true,
          [require('sequelize').Op.or]: [
            { fechaFin: null },
            { fechaFin: { [require('sequelize').Op.gte]: new Date() } }
          ]
        },
        include: [{ model: Cliente, as: 'cliente' }],
        order: [['fechaInicio', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Membresías activas obtenidas exitosamente',
        data: membresias
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener membresías activas'
      });
    }
  }
}

module.exports = new MembresiaController();
