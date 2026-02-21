const { Admin } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * Controller para Admin/Usuario del Sistema
 * CRUD completo para gestión de administradores
 */
class AdminController {
  /**
   * Crear un nuevo administrador
   * POST /api/admin
   */
  async create(req, res) {
    try {
      const { nombre, email, password, rol, activo } = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, email y password son requeridos'
        });
      }

      // Hashear password antes de guardar
      const hashedPassword = await hashPassword(password);

      const admin = await Admin.create({
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'admin',
        activo: activo !== undefined ? activo : true
      });

      return res.status(201).json({
        success: true,
        message: 'Administrador creado exitosamente',
        data: admin
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear administrador'
      });
    }
  }

  /**
   * Obtener todos los administradores
   * GET /api/admin
   */
  async getAll(req, res) {
    try {
      const admins = await Admin.findAll({
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] } // No mostrar contraseñas
      });
      
      return res.status(200).json({
        success: true,
        message: 'Administradores obtenidos exitosamente',
        data: admins
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener administradores'
      });
    }
  }

  /**
   * Obtener un administrador por ID
   * GET /api/admin/:id
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

      const admin = await Admin.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Administrador obtenido exitosamente',
        data: admin
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener administrador'
      });
    }
  }

  /**
   * Actualizar un administrador
   * PUT /api/admin/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, password, rol, activo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const admin = await Admin.findByPk(id);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }

      const updateData = { nombre, email, rol, activo };
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await admin.update(updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Administrador actualizado exitosamente',
        data: { ...admin.toJSON(), password: undefined }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar administrador'
      });
    }
  }

  /**
   * Eliminar un administrador
   * DELETE /api/admin/:id
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

      const admin = await Admin.findByPk(id);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }

      await admin.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Administrador eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar administrador'
      });
    }
  }
}

module.exports = new AdminController();
