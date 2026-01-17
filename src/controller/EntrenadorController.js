const { Entrenador } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * Controller para Entrenador
 * CRUD completo para gestión de entrenadores del gym
 */
class EntrenadorController {
  /**
   * Crear un nuevo entrenador
   * POST /api/entrenador
   */
  async create(req, res) {
    try {
      const { 
        nombre, 
        apellido, 
        cedula, 
        email, 
        password, 
        telefono, 
        especialidad,
        activo
      } = req.body;

      // Validaciones básicas
      if (!nombre || !apellido) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y apellido son requeridos'
        });
      }

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y password son requeridos'
        });
      }

      // Hashear password
      const hashedPassword = await hashPassword(password);

      // Crear el entrenador
      const nuevoEntrenador = await Entrenador.create({
        nombre,
        apellido,
        cedula: cedula || null,
        email,
        password: hashedPassword,
        telefono: telefono || null,
        especialidad: especialidad || null,
        activo: activo !== undefined ? activo : true
      });

      return res.status(201).json({
        success: true,
        message: 'Entrenador creado exitosamente',
        data: nuevoEntrenador
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear entrenador'
      });
    }
  }

  /**
   * Obtener todos los entrenadores
   * GET /api/entrenador
   */
  async getAll(req, res) {
    try {
      const entrenadores = await Entrenador.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Entrenadores obtenidos exitosamente',
        data: entrenadores
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener entrenadores'
      });
    }
  }

  /**
   * Obtener un entrenador por ID
   * GET /api/entrenador/:id
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

      const entrenador = await Entrenador.findByPk(id);

      if (!entrenador) {
        return res.status(404).json({
          success: false,
          message: 'Entrenador no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Entrenador obtenido exitosamente',
        data: entrenador
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener entrenador'
      });
    }
  }

  /**
   * Actualizar un entrenador
   * PUT /api/entrenador/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre, 
        apellido, 
        cedula, 
        email, 
        password, 
        telefono, 
        especialidad,
        activo 
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const entrenador = await Entrenador.findByPk(id);
      
      if (!entrenador) {
        return res.status(404).json({
          success: false,
          message: 'Entrenador no encontrado'
        });
      }

      const updateData = {
        nombre: nombre !== undefined ? nombre : entrenador.nombre,
        apellido: apellido !== undefined ? apellido : entrenador.apellido,
        cedula: cedula !== undefined ? cedula : entrenador.cedula,
        email: email !== undefined ? email : entrenador.email,
        telefono: telefono !== undefined ? telefono : entrenador.telefono,
        especialidad: especialidad !== undefined ? especialidad : entrenador.especialidad,
        activo: activo !== undefined ? activo : entrenador.activo
      };

      // Solo actualizar password si se proporciona
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await entrenador.update(updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Entrenador actualizado exitosamente',
        data: entrenador
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar entrenador'
      });
    }
  }

  /**
   * Eliminar un entrenador
   * DELETE /api/entrenador/:id
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

      const entrenador = await Entrenador.findByPk(id);
      
      if (!entrenador) {
        return res.status(404).json({
          success: false,
          message: 'Entrenador no encontrado'
        });
      }

      await entrenador.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Entrenador eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar entrenador'
      });
    }
  }
}

module.exports = new EntrenadorController();
