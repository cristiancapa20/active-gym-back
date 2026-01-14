const { Admin, Cliente } = require('../models');

/**
 * Controller para Autenticación
 * Maneja login unificado para Admin y Cliente
 */
class AuthController {
  /**
   * Login unificado (Admin y Cliente)
   * Ambos usan email y password
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y password son requeridos'
        });
      }

      let user = null;

      // Primero intentar buscar como Admin
      const admin = await Admin.findOne({
        where: { email }
      });

      if (admin) {
        // TODO: Comparar password hasheado (usar bcrypt)
        if (admin.password === password) {
          if (!admin.activo) {
            return res.status(403).json({
              success: false,
              message: 'Cuenta inactiva'
            });
          }
          user = {
            id: admin.id,
            nombre: admin.nombre,
            email: admin.email,
            rol: admin.rol,
            tipo: 'admin'
          };
        }
      }

      // Si no es admin, intentar como Cliente
      if (!user) {
        const cliente = await Cliente.findOne({
          where: { email }
        });

        if (cliente) {
          // Validar password del cliente
          // TODO: Comparar password hasheado (usar bcrypt)
          if (cliente.password && cliente.password !== password) {
            return res.status(401).json({
              success: false,
              message: 'Credenciales inválidas'
            });
          }

          if (!cliente.activo) {
            return res.status(403).json({
              success: false,
              message: 'Cuenta inactiva'
            });
          }
          user = {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            email: cliente.email,
            cedula: cliente.cedula,
            tipo: 'cliente'
          };
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // TODO: Generar JWT token
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user,
          token: 'token_jwt_aqui' // TODO: Implementar JWT
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al hacer login'
      });
    }
  }

  /**
   * Registro de Admin (solo para crear otros admins)
   * POST /api/auth/admin/register
   */
  async adminRegister(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, email y password son requeridos'
        });
      }

      // Verificar si el email ya existe en Admin o Cliente
      const adminExistente = await Admin.findOne({
        where: { email }
      });

      if (adminExistente) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // TODO: Hashear password antes de guardar
      const nuevoAdmin = await Admin.create({
        nombre,
        email,
        password, // TODO: Hashear con bcrypt
        rol: rol || 'admin',
        activo: true
      });

      return res.status(201).json({
        success: true,
        message: 'Administrador registrado exitosamente',
        data: {
          user: {
            id: nuevoAdmin.id,
            nombre: nuevoAdmin.nombre,
            email: nuevoAdmin.email,
            rol: nuevoAdmin.rol,
            tipo: 'admin'
          }
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar administrador'
      });
    }
  }
}

module.exports = new AuthController();
