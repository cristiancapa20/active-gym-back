const { Configuracion, Gym } = require('../models');

/**
 * Controller para Configuraciones
 * Maneja la configuración del sistema, incluyendo módulos activos/inactivos
 */
class ConfiguracionController {
  /**
   * Obtener todas las configuraciones de un gym
   * GET /api/configuracion?gymId=xxx
   */
  async getAll(req, res) {
    try {
      // Validar que req exista
      if (!req) {
        console.error('❌ req es undefined en getAll');
        return res.status(500).json({
          success: false,
          message: 'Error interno: request no válido'
        });
      }
      
      const { gymId } = req.query;
      
      // Obtener usuario desde header o body
      let user = null;
      if (req.user) {
        user = req.user;
      } else if (req.body && req.body.user) {
        user = req.body.user;
      }
      
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

      if (!gymId) {
        return res.status(400).json({
          success: false,
          message: 'gymId es requerido'
        });
      }

      // Verificar acceso: super_admin puede ver cualquier gym, admin solo el suyo
      if (user && user.rol !== 'super_admin' && user.gymId !== gymId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a las configuraciones de este gimnasio'
        });
      }
      
      // Si no hay configuraciones, crear las por defecto
      let configuraciones = [];
      try {
        configuraciones = await Configuracion.findAll({
          where: { gymId, activo: true },
          order: [['clave', 'ASC']]
        });
      } catch (dbError) {
        console.error('❌ Error al buscar configuraciones:', dbError);
        
        // Si el error es porque la columna gymId no existe, informar al usuario
        if (dbError.message && dbError.message.includes('gymId')) {
          return res.status(500).json({
            success: false,
            message: 'La tabla de configuraciones no tiene la columna gymId. Ejecuta el script de migración.',
            error: dbError.message
          });
        }
        throw dbError;
      }

      // Si no hay configuraciones, crear las por defecto
      if (configuraciones.length === 0) {
        const configuracionesDefault = [
          { clave: 'modulo_qr', valor: true, descripcion: 'Módulo de códigos QR para registro de asistencia' },
          { clave: 'modulo_notificaciones', valor: true, descripcion: 'Módulo de notificaciones para membresías próximas a vencer' },
          { clave: 'modulo_entrenadores', valor: true, descripcion: 'Módulo de gestión de entrenadores' },
          { clave: 'modulo_asistencia', valor: true, descripcion: 'Módulo de registro de asistencia' }
        ];

        try {
          for (const config of configuracionesDefault) {
            await Configuracion.create({
              gymId,
              clave: config.clave,
              valor: config.valor,
              descripcion: config.descripcion,
              activo: true
            });
          }

          // Volver a obtener las configuraciones
          configuraciones = await Configuracion.findAll({
            where: { gymId, activo: true },
            order: [['clave', 'ASC']]
          });
        } catch (createError) {
          console.error('❌ Error al crear configuraciones por defecto:', createError);
          throw createError;
        }
      }

      // Convertir a un objeto más fácil de usar
      const configMap = {};
      configuraciones.forEach(config => {
        // Si valor es un objeto JSONB, extraer el valor directamente
        let valor = config.valor;
        if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
          // Si es un objeto JSONB con una propiedad, extraerla
          valor = Object.values(valor)[0] || valor;
        }
        configMap[config.clave] = valor;
      });

      return res.status(200).json({
        success: true,
        data: configMap
      });
    } catch (error) {
      console.error('❌ Error al obtener configuraciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener configuraciones',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Obtener una configuración por clave y gymId
   * GET /api/configuracion/:gymId/:clave
   */
  async getByClave(req, res) {
    try {
      const { gymId, clave } = req.params;
      const user = req.user || req.body.user;

      if (!gymId || !clave) {
        return res.status(400).json({
          success: false,
          message: 'gymId y clave son requeridos'
        });
      }

      // Verificar acceso
      if (user && user.rol !== 'super_admin' && user.gymId !== gymId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta configuración'
        });
      }

      const configuracion = await Configuracion.findOne({
        where: { gymId, clave, activo: true }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          clave: configuracion.clave,
          valor: configuracion.valor,
          descripcion: configuracion.descripcion
        }
      });
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener configuración',
        error: error.message
      });
    }
  }

  /**
   * Crear o actualizar una configuración
   * PUT /api/configuracion/:gymId/:clave
   * Solo super_admin puede modificar configuraciones
   */
  async upsert(req, res) {
    try {
      // Verificar que el usuario sea super_admin
      const user = req.user || req.body.user;
      const userFromHeader = req.headers['x-user'];
      let parsedUser = null;
      if (userFromHeader) {
        try {
          parsedUser = JSON.parse(userFromHeader);
        } catch (e) {
          // Ignorar error de parsing
        }
      }
      const finalUser = user || parsedUser;

      if (!finalUser || finalUser.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede modificar configuraciones'
        });
      }

      const { gymId, clave } = req.params;
      const { valor, descripcion } = req.body;

      if (!gymId || !clave) {
        return res.status(400).json({
          success: false,
          message: 'gymId y clave son requeridos'
        });
      }

      if (valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El valor es requerido'
        });
      }

      // Verificar que el gym existe
      const gym = await Gym.findByPk(gymId);
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gimnasio no encontrado'
        });
      }

      const [configuracion, created] = await Configuracion.upsert({
        gymId,
        clave,
        valor,
        descripcion: descripcion || null,
        activo: true
      }, {
        returning: true
      });

      return res.status(created ? 201 : 200).json({
        success: true,
        message: created ? 'Configuración creada exitosamente' : 'Configuración actualizada exitosamente',
        data: {
          clave: configuracion.clave,
          valor: configuracion.valor,
          descripcion: configuracion.descripcion
        }
      });
    } catch (error) {
      console.error('Error al crear/actualizar configuración:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear/actualizar configuración',
        error: error.message
      });
    }
  }

  /**
   * Actualizar múltiples configuraciones a la vez
   * POST /api/configuracion/:gymId/bulk-update
   * Solo super_admin puede modificar configuraciones
   */
  async bulkUpdate(req, res) {
    try {
      // Verificar que el usuario sea super_admin
      const user = req.user || req.body.user;
      const userFromHeader = req.headers['x-user'];
      let parsedUser = null;
      if (userFromHeader) {
        try {
          parsedUser = JSON.parse(userFromHeader);
        } catch (e) {
          // Ignorar error de parsing
        }
      }
      const finalUser = user || parsedUser;

      if (!finalUser || finalUser.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el super administrador puede modificar configuraciones'
        });
      }

      const { gymId } = req.params;
      const { configuraciones } = req.body;

      if (!gymId) {
        return res.status(400).json({
          success: false,
          message: 'gymId es requerido'
        });
      }

      if (!configuraciones || typeof configuraciones !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un objeto de configuraciones'
        });
      }

      // Verificar que el gym existe
      const gym = await Gym.findByPk(gymId);
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gimnasio no encontrado'
        });
      }

      const updates = [];
      for (const [clave, valor] of Object.entries(configuraciones)) {
        updates.push(
          Configuracion.upsert({
            gymId,
            clave,
            valor,
            activo: true
          }, {
            returning: true
          })
        );
      }

      await Promise.all(updates);

      return res.status(200).json({
        success: true,
        message: 'Configuraciones actualizadas exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar configuraciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar configuraciones',
        error: error.message
      });
    }
  }
}

module.exports = new ConfiguracionController();
