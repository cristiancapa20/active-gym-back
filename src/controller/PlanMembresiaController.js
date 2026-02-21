const { PlanMembresia } = require('../models');

/**
 * Controller para Plan de Membresía
 * CRUD completo para gestión de planes de membresía
 */
class PlanMembresiaController {
  /**
   * Crear un nuevo plan de membresía
   * POST /api/plan-membresia
   */
  async create(req, res) {
    try {
      const { nombre, tipo, duracionDias, precio, activo } = req.body;

      // Validaciones básicas
      if (!nombre || !tipo || !duracionDias || precio === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, tipo, duracionDias y precio son requeridos'
        });
      }

      const plan = await PlanMembresia.create({
        nombre,
        tipo,
        duracionDias,
        precio,
        activo: activo !== undefined ? activo : true
      });

      return res.status(201).json({
        success: true,
        message: 'Plan de membresía creado exitosamente',
        data: plan
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear plan de membresía'
      });
    }
  }

  /**
   * Obtener todos los planes de membresía
   * GET /api/plan-membresia
   */
  async getAll(req, res) {
    try {
      const { activo } = req.query;
      
      const where = {};
      if (activo !== undefined) {
        where.activo = activo === 'true';
      }

      const planes = await PlanMembresia.findAll({
        where,
        order: [['duracionDias', 'ASC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Planes de membresía obtenidos exitosamente',
        data: planes
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener planes de membresía'
      });
    }
  }

  /**
   * Obtener un plan por ID
   * GET /api/plan-membresia/:id
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

      const plan = await PlanMembresia.findByPk(id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de membresía no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Plan de membresía obtenido exitosamente',
        data: plan
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener plan de membresía'
      });
    }
  }

  /**
   * Actualizar un plan de membresía
   * PUT /api/plan-membresia/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, tipo, duracionDias, precio, activo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const plan = await PlanMembresia.findByPk(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de membresía no encontrado'
        });
      }

      await plan.update({
        nombre: nombre !== undefined ? nombre : plan.nombre,
        tipo: tipo !== undefined ? tipo : plan.tipo,
        duracionDias: duracionDias !== undefined ? duracionDias : plan.duracionDias,
        precio: precio !== undefined ? precio : plan.precio,
        activo: activo !== undefined ? activo : plan.activo
      });
      
      return res.status(200).json({
        success: true,
        message: 'Plan de membresía actualizado exitosamente',
        data: plan
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar plan de membresía'
      });
    }
  }

  /**
   * Eliminar un plan de membresía
   * DELETE /api/plan-membresia/:id
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

      const plan = await PlanMembresia.findByPk(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de membresía no encontrado'
        });
      }

      await plan.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Plan de membresía eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar plan de membresía'
      });
    }
  }
}

module.exports = new PlanMembresiaController();
