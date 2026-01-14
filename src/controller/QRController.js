const { QR, Cliente, Membresia } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller para QR
 * CRUD completo para gestión de códigos QR de acceso
 */
class QRController {
  /**
   * Crear un nuevo código QR
   * POST /api/qr
   */
  async create(req, res) {
    try {
      const { clienteId, membresiaId, codigo, fechaExpiracion, activo } = req.body;

      // Validaciones básicas
      if (!clienteId || !membresiaId || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'ClienteId, MembresiaId y código son requeridos'
        });
      }

      // Verificar que el cliente y la membresía existen
      const cliente = await Cliente.findByPk(clienteId);
      const membresia = await Membresia.findByPk(membresiaId);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
      
      if (!membresia) {
        return res.status(404).json({
          success: false,
          message: 'Membresía no encontrada'
        });
      }

      const nuevoQR = await QR.create({
        clienteId,
        membresiaId,
        codigo,
        fechaCreacion: new Date(),
        fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
        activo: activo !== undefined ? activo : true
      });

      return res.status(201).json({
        success: true,
        message: 'Código QR creado exitosamente',
        data: nuevoQR
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear código QR'
      });
    }
  }

  /**
   * Obtener todos los códigos QR
   * GET /api/qr
   */
  async getAll(req, res) {
    try {
      const { clienteId, membresiaId } = req.query;
      
      const where = {};
      if (clienteId) where.clienteId = clienteId;
      if (membresiaId) where.membresiaId = membresiaId;

      const qrs = await QR.findAll({
        where,
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Membresia, as: 'membresia' }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Códigos QR obtenidos exitosamente',
        data: qrs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener códigos QR'
      });
    }
  }

  /**
   * Obtener un código QR por ID
   * GET /api/qr/:id
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

      const qr = await QR.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Membresia, as: 'membresia' }
        ]
      });

      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'Código QR no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Código QR obtenido exitosamente',
        data: qr
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener código QR'
      });
    }
  }

  /**
   * Actualizar un código QR
   * PUT /api/qr/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { clienteId, membresiaId, codigo, fechaExpiracion, activo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const qr = await QR.findByPk(id);
      
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'Código QR no encontrado'
        });
      }

      await qr.update({
        clienteId,
        membresiaId,
        codigo,
        fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : qr.fechaExpiracion,
        activo
      });
      
      return res.status(200).json({
        success: true,
        message: 'Código QR actualizado exitosamente',
        data: qr
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar código QR'
      });
    }
  }

  /**
   * Eliminar un código QR
   * DELETE /api/qr/:id
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

      const qr = await QR.findByPk(id);
      
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'Código QR no encontrado'
        });
      }

      await qr.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Código QR eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar código QR'
      });
    }
  }

  /**
   * Validar un código QR (verificar si es válido para acceso)
   * POST /api/qr/validar
   */
  async validar(req, res) {
    try {
      const { codigo } = req.body;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código QR es requerido'
        });
      }

      const qr = await QR.findOne({
        where: { codigo },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Membresia, as: 'membresia' }
        ]
      });
      
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'Código QR no encontrado'
        });
      }
      
      // Validar que el QR esté activo
      if (!qr.activo) {
        return res.status(400).json({
          success: false,
          message: 'Código QR inactivo'
        });
      }
      
      // Validar que la membresía esté activa
      if (!qr.membresia || !qr.membresia.activa) {
        return res.status(400).json({
          success: false,
          message: 'Membresía inactiva'
        });
      }
      
      // Validar que la membresía no haya expirado
      // El QR es válido mientras la membresía esté activa y no haya expirado
      // La fecha de expiración del QR debe coincidir con la fecha fin de la membresía
      if (qr.membresia.fechaFin) {
        const ahora = new Date();
        const fechaFinMembresia = new Date(qr.membresia.fechaFin);
        
        // Normalizar ambas fechas a medianoche para comparar solo el día (sin horas)
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const fechaFin = new Date(fechaFinMembresia.getFullYear(), fechaFinMembresia.getMonth(), fechaFinMembresia.getDate());
        
        // La membresía es válida hasta el final del día de fechaFin (inclusive)
        // Comparar: si hoy es mayor que fechaFin, entonces está expirada
        // Si hoy es igual o menor, entonces aún es válida
        if (hoy.getTime() > fechaFin.getTime()) {
          console.log(`Membresía expirada - Hoy: ${hoy.toISOString()}, FechaFin: ${fechaFin.toISOString()}`);
          return res.status(400).json({
            success: false,
            message: `Membresía expirada (expiró el ${fechaFin.toLocaleDateString('es-ES')})`
          });
        }
      }
      
      // No validamos la fecha de expiración del QR directamente
      // porque debe coincidir con la membresía. Si la membresía es válida, el QR es válido

      return res.status(200).json({
        success: true,
        message: 'Código QR válido',
        data: {
          qr,
          cliente: qr.cliente,
          membresia: qr.membresia
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al validar código QR'
      });
    }
  }

  /**
   * Obtener QR por código
   * GET /api/qr/codigo/:codigo
   */
  async getByCodigo(req, res) {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código es requerido'
        });
      }

      const qr = await QR.findOne({
        where: { codigo },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Membresia, as: 'membresia' }
        ]
      });

      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'Código QR no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Código QR obtenido exitosamente',
        data: qr
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener código QR'
      });
    }
  }
}

module.exports = new QRController();
