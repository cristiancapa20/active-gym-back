const { Gym, Admin, Configuracion } = require('../models');

// Función helper para obtener usuario desde request
const getUserFromRequest = (req) => {
  // Validar que req exista
  if (!req) {
    return null;
  }

  let user = null;
  
  // Intentar obtener usuario de req.user o req.body.user
  if (req.user) {
    user = req.user;
  } else if (req.body && req.body.user) {
    user = req.body.user;
  }
  
  // Si no se encontró, intentar desde el header
  if (!user) {
    const userFromHeader = req.headers && req.headers['x-user'];
    if (userFromHeader) {
      try {
        user = JSON.parse(userFromHeader);
      } catch (e) {
        console.error('❌ Error al parsear usuario del header:', e);
      }
    }
  }
  
  return user;
};

/**
 * Controller para Gym
 * Maneja la gestión de gimnasios (multitenant)
 */
class GymController {
  /**
   * Crear un nuevo gimnasio
   * POST /api/gym
   * Solo super_admin puede crear gyms
   */
  async create(req, res) {
    try {
      // Verificar que el usuario sea super_admin
      const user = getUserFromRequest(req);
      if (!user || user.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede crear gimnasios'
        });
      }

      const { nombre, codigo, direccion, telefono, email } = req.body;

      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y código son requeridos'
        });
      }

      // Verificar que el código sea único
      const gymExistente = await Gym.findOne({ where: { codigo } });
      if (gymExistente) {
        return res.status(400).json({
          success: false,
          message: 'El código del gimnasio ya existe'
        });
      }

      const gym = await Gym.create({
        nombre,
        codigo,
        direccion,
        telefono,
        email,
        activo: true
      });

      // Crear configuraciones por defecto para este gym
      const configuracionesDefault = [
        { clave: 'modulo_qr', valor: true, descripcion: 'Módulo de códigos QR para registro de asistencia' },
        { clave: 'modulo_notificaciones', valor: true, descripcion: 'Módulo de notificaciones para membresías próximas a vencer' },
        { clave: 'modulo_entrenadores', valor: true, descripcion: 'Módulo de gestión de entrenadores' },
        { clave: 'modulo_asistencia', valor: true, descripcion: 'Módulo de registro de asistencia' }
      ];

      for (const config of configuracionesDefault) {
        await Configuracion.create({
          gymId: gym.id,
          ...config,
          activo: true
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Gimnasio creado exitosamente',
        data: gym
      });
    } catch (error) {
      console.error('Error al crear gimnasio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear gimnasio',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los gimnasios
   * GET /api/gym
   * Solo super_admin puede ver todos los gyms
   */
  async getAll(req, res) {
    try {
      // Verificar que el usuario sea super_admin
      const user = getUserFromRequest(req);
      
      if (!user) {
        console.log('❌ No se encontró usuario en la petición');
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      if (user.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede ver todos los gimnasios'
        });
      }

      // Verificar que el modelo Gym esté correctamente inicializado
      if (!Gym) {
        console.error('❌ El modelo Gym no está definido');
        return res.status(500).json({
          success: false,
          message: 'Error de configuración del modelo Gym'
        });
      }

      try {
        const gyms = await Gym.findAll({
          order: [['nombre', 'ASC']]
        });

        return res.status(200).json({
          success: true,
          data: gyms || []
        });
      } catch (dbError) {
        console.error('❌ Error en la consulta a la base de datos:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Error al consultar la base de datos',
          error: dbError.message,
          details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        });
      }
    } catch (error) {
      console.error('❌ Error al obtener gimnasios:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack completo:', error.stack);
      
      // Si es un error de base de datos, dar más información
      if (error.name === 'SequelizeDatabaseError') {
        console.error('❌ Error de base de datos:', error.original?.message || error.message);
        return res.status(500).json({
          success: false,
          message: 'Error de base de datos al obtener gimnasios',
          error: error.message,
          details: error.original?.message || 'Error desconocido de base de datos'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al obtener gimnasios',
        error: error.message,
        errorName: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Obtener un gimnasio por ID
   * GET /api/gym/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = getUserFromRequest(req);

      const gym = await Gym.findByPk(id, {
        include: [
          {
            model: Admin,
            as: 'admins',
            attributes: ['id', 'nombre', 'email', 'rol', 'activo'],
            required: false
          },
          {
            model: Configuracion,
            as: 'configuraciones',
            where: { activo: true },
            required: false
          }
        ]
      });

      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gimnasio no encontrado'
        });
      }

      // Si no es super_admin, verificar que tenga acceso a este gym
      if (user && user.rol !== 'super_admin' && user.gymId !== gym.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este gimnasio'
        });
      }

      return res.status(200).json({
        success: true,
        data: gym
      });
    } catch (error) {
      console.error('Error al obtener gimnasio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener gimnasio',
        error: error.message
      });
    }
  }

  /**
   * Actualizar un gimnasio
   * PUT /api/gym/:id
   * Solo super_admin puede actualizar
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const user = getUserFromRequest(req);

      if (!user || user.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede actualizar gimnasios'
        });
      }

      const { nombre, codigo, direccion, telefono, email, activo } = req.body;

      const gym = await Gym.findByPk(id);
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gimnasio no encontrado'
        });
      }

      // Si se cambia el código, verificar que sea único
      if (codigo && codigo !== gym.codigo) {
        const gymExistente = await Gym.findOne({ where: { codigo } });
        if (gymExistente) {
          return res.status(400).json({
            success: false,
            message: 'El código del gimnasio ya existe'
          });
        }
      }

      // Convertir strings vacíos a null para campos opcionales
      await gym.update({
        nombre,
        codigo,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        activo
      });

      return res.status(200).json({
        success: true,
        message: 'Gimnasio actualizado exitosamente',
        data: gym
      });
    } catch (error) {
      console.error('Error al actualizar gimnasio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar gimnasio',
        error: error.message
      });
    }
  }

  /**
   * Eliminar un gimnasio
   * DELETE /api/gym/:id
   * Solo super_admin puede eliminar
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const user = getUserFromRequest(req);

      if (!user || user.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede eliminar gimnasios'
        });
      }

      const gym = await Gym.findByPk(id);
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gimnasio no encontrado'
        });
      }

      await gym.destroy();

      return res.status(200).json({
        success: true,
        message: 'Gimnasio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar gimnasio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar gimnasio',
        error: error.message
      });
    }
  }
}

module.exports = new GymController();
