const { Membresia, Cliente, PlanMembresia } = require('../models');
const { Op } = require('sequelize');

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
      const { clienteId, planId, tipo, fechaInicio, fechaFin, estado, tipoPago, precio } = req.body;

      // Validaciones básicas
      if (!clienteId || !tipo || precio === undefined || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId, tipo, precio y fechaFin son requeridos'
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

      // Si se proporciona planId, verificar que existe
      if (planId) {
        const plan = await PlanMembresia.findByPk(planId);
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plan de membresía no encontrado'
          });
        }
      }

      // Marcar membresías activas anteriores como vencidas
      await Membresia.update(
        { estado: 'vencida' },
        {
          where: {
            clienteId,
            estado: 'activa'
          }
        }
      );

      const membresia = await Membresia.create({
        clienteId,
        planId: planId || null,
        tipo,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaFin: new Date(fechaFin),
        estado: estado || 'activa',
        tipoPago: tipoPago || null,
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
        include: [
          { model: Cliente, as: 'cliente' },
          { model: PlanMembresia, as: 'plan' }
        ],
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
        include: [
          { model: Cliente, as: 'cliente' },
          { model: PlanMembresia, as: 'plan' }
        ]
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
      const { planId, tipo, fechaInicio, fechaFin, estado, tipoPago, precio } = req.body;

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

      // Si se proporciona planId, verificar que existe
      if (planId) {
        const plan = await PlanMembresia.findByPk(planId);
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plan de membresía no encontrado'
          });
        }
      }

      await membresia.update({
        planId: planId !== undefined ? planId : membresia.planId,
        tipo: tipo !== undefined ? tipo : membresia.tipo,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : membresia.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : membresia.fechaFin,
        estado: estado !== undefined ? estado : membresia.estado,
        tipoPago: tipoPago !== undefined ? tipoPago : membresia.tipoPago,
        precio: precio !== undefined ? precio : membresia.precio
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
          estado: 'activa',
          fechaFin: { [Op.gte]: new Date() }
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: PlanMembresia, as: 'plan' }
        ],
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

  /**
   * Renovar membresía (crear nueva y marcar anteriores como vencidas)
   * POST /api/membresia/renovar
   */
  async renovar(req, res) {
    try {
      const { clienteId, planId, tipo, fechaInicio, fechaFin, tipoPago, precio } = req.body;

      // Validaciones básicas
      if (!clienteId || !tipo || precio === undefined || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId, tipo, precio y fechaFin son requeridos'
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

      // Si se proporciona planId, verificar que existe
      if (planId) {
        const plan = await PlanMembresia.findByPk(planId);
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plan de membresía no encontrado'
          });
        }
      }

      // Marcar todas las membresías activas del cliente como vencidas
      await Membresia.update(
        { estado: 'vencida' },
        {
          where: {
            clienteId,
            estado: 'activa'
          }
        }
      );

      // Crear nueva membresía
      const nuevaMembresia = await Membresia.create({
        clienteId,
        planId: planId || null,
        tipo,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaFin: new Date(fechaFin),
        estado: 'activa',
        tipoPago: tipoPago || null,
        precio
      });

      return res.status(201).json({
        success: true,
        message: 'Membresía renovada exitosamente',
        data: nuevaMembresia
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al renovar membresía'
      });
    }
  }
}

module.exports = new MembresiaController();
