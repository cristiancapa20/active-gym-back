const { Admin, Cliente, Entrenador } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * Controller para Autenticación
 * Maneja login unificado para Admin, Cliente y Entrenador
 */
class AuthController {
  /**
   * Login unificado (Admin, Cliente y Entrenador)
   * Todos usan email y password
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

      console.log(`🔐 Intento de login para: ${email}`);

      let user = null;

      // Primero intentar buscar como Admin
      const admin = await Admin.findOne({
        where: { email }
      });

      if (admin) {
        console.log(`👤 Admin encontrado: ${admin.nombre}`);
        // Comparar password hasheado
        const isPasswordValid = await comparePassword(password, admin.password);
        console.log(`🔑 Validación de contraseña admin: ${isPasswordValid}`);
        if (isPasswordValid) {
          if (!admin.activo) {
            console.log(`❌ Admin inactivo: ${admin.email}`);
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
            tipo: 'admin',
            gymId: admin.gymId
          };
          console.log(`✅ Login exitoso como admin: ${admin.nombre}`);
        } else {
          console.log(`❌ Contraseña incorrecta para admin: ${admin.email}`);
        }
      }

      // Si no es admin, intentar como Entrenador
      if (!user) {
        const entrenador = await Entrenador.findOne({
          where: { email }
        });

        if (entrenador) {
          console.log(`👤 Entrenador encontrado: ${entrenador.nombre} ${entrenador.apellido}`);
          // Validar password del entrenador
          if (entrenador.password) {
            const isPasswordValid = await comparePassword(password, entrenador.password);
            console.log(`🔑 Validación de contraseña entrenador: ${isPasswordValid}`);
            if (!isPasswordValid) {
              console.log(`❌ Contraseña incorrecta para entrenador: ${entrenador.email}`);
              return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
              });
            }
          } else {
            console.log(`⚠️ Entrenador sin contraseña: ${entrenador.email}`);
            return res.status(401).json({
              success: false,
              message: 'Credenciales inválidas'
            });
          }

          if (!entrenador.activo) {
            console.log(`❌ Entrenador inactivo: ${entrenador.email}`);
            return res.status(403).json({
              success: false,
              message: 'Cuenta inactiva'
            });
          }
          user = {
            id: entrenador.id,
            nombre: entrenador.nombre,
            apellido: entrenador.apellido,
            email: entrenador.email,
            cedula: entrenador.cedula,
            especialidad: entrenador.especialidad,
            tipo: 'entrenador'
          };
          console.log(`✅ Login exitoso como entrenador: ${entrenador.nombre} ${entrenador.apellido}`);
        }
      }

      // Si no es admin ni entrenador, intentar como Cliente
      if (!user) {
        const cliente = await Cliente.findOne({
          where: { email }
        });

        if (cliente) {
          console.log(`👤 Cliente encontrado: ${cliente.nombre} ${cliente.apellido}`);
          // Validar password del cliente
          if (cliente.password) {
            const isPasswordValid = await comparePassword(password, cliente.password);
            console.log(`🔑 Validación de contraseña cliente: ${isPasswordValid}`);
            if (!isPasswordValid) {
              console.log(`❌ Contraseña incorrecta para cliente: ${cliente.email}`);
              return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
              });
            }
          } else {
            console.log(`⚠️ Cliente sin contraseña: ${cliente.email}`);
            return res.status(401).json({
              success: false,
              message: 'Credenciales inválidas'
            });
          }

          if (!cliente.activo) {
            console.log(`❌ Cliente inactivo: ${cliente.email}`);
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
          console.log(`✅ Login exitoso como cliente: ${cliente.nombre} ${cliente.apellido}`);
        } else {
          console.log(`❌ Usuario no encontrado: ${email}`);
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

      // Hashear password antes de guardar
      const hashedPassword = await hashPassword(password);
      const nuevoAdmin = await Admin.create({
        nombre,
        email,
        password: hashedPassword,
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
