const { Cliente, Membresia, QR } = require('../models');
const crypto = require('crypto');
const { hashPassword } = require('../utils/password');

/**
 * Función para generar un código QR único
 */
function generarCodigoQR() {
  // Generar un código único de 16 caracteres alfanuméricos
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Controller para Cliente
 * CRUD completo para gestión de clientes del gym
 */
class ClienteController {
  /**
   * Crear un nuevo cliente
   * POST /api/cliente
   * Crea automáticamente una membresía y un QR único para el cliente
   */
  async create(req, res) {
    try {
      const { 
        nombre, 
        apellido, 
        cedula, 
        email, 
        password, 
        peso, 
        telefono, 
        fechaInicio, 
        fechaFin, 
        tipoPago, 
        activo,
        tipoMembresia,
        precioMembresia
      } = req.body;

      // Validaciones básicas
      if (!nombre || !apellido) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y apellido son requeridos'
        });
      }

      // Validar que si se proporciona email, también se proporcione password
      if (email && !password) {
        return res.status(400).json({
          success: false,
          message: 'Si se proporciona email, también se requiere password'
        });
      }

      // Hashear password si se proporciona
      const hashedPassword = password ? await hashPassword(password) : null;

      // Crear el cliente
      const nuevoCliente = await Cliente.create({
        nombre,
        apellido,
        cedula: cedula || null,
        email: email || null,
        password: hashedPassword,
        peso: peso || null,
        telefono: telefono || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        tipoPago: tipoPago || null,
        activo: activo !== undefined ? activo : true
      });

      // Crear membresía automáticamente (siempre se crea una membresía)
      const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : new Date();
      
      // Calcular fecha fin basada en el tipo de membresía si no se proporciona
      let fechaFinCalculada = fechaFin ? new Date(fechaFin) : null;
      
      if (!fechaFinCalculada && tipoMembresia) {
        fechaFinCalculada = new Date(fechaInicioDate);
        
        switch (tipoMembresia) {
          case 'mensual':
            fechaFinCalculada.setMonth(fechaFinCalculada.getMonth() + 1);
            break;
          case 'trimestral':
            fechaFinCalculada.setMonth(fechaFinCalculada.getMonth() + 3);
            break;
          case 'semestral':
            fechaFinCalculada.setMonth(fechaFinCalculada.getMonth() + 6);
            break;
          case 'anual':
            fechaFinCalculada.setFullYear(fechaFinCalculada.getFullYear() + 1);
            break;
        }
      }

      const nuevaMembresia = await Membresia.create({
        clienteId: nuevoCliente.id,
        tipo: tipoMembresia || 'mensual',
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinCalculada,
        precio: precioMembresia || 0,
        activa: true
      });

      // Crear QR único automáticamente
      // Generar código único
      let codigoQR = generarCodigoQR();
      
      // Verificar que el código sea único (por si acaso hay colisión)
      let qrExistente = await QR.findOne({ where: { codigo: codigoQR } });
      while (qrExistente) {
        codigoQR = generarCodigoQR();
        qrExistente = await QR.findOne({ where: { codigo: codigoQR } });
      }

      // Calcular fecha de expiración del QR (mismo que la membresía o 1 año por defecto)
      const fechaExpiracionQR = fechaFinCalculada || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const nuevoQR = await QR.create({
        clienteId: nuevoCliente.id,
        membresiaId: nuevaMembresia.id,
        codigo: codigoQR,
        fechaCreacion: new Date(),
        fechaExpiracion: fechaExpiracionQR,
        activo: true
      });

      // Obtener el cliente con sus relaciones para retornarlo
      const clienteCompleto = await Cliente.findByPk(nuevoCliente.id, {
        include: [
          { model: Membresia, as: 'membresias' },
          { model: QR, as: 'qrs' }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente con membresía y QR',
        data: {
          cliente: clienteCompleto,
          membresia: nuevaMembresia,
          qr: nuevoQR
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear cliente'
      });
    }
  }

  /**
   * Obtener todos los clientes
   * GET /api/cliente
   */
  async getAll(req, res) {
    try {
      const clientes = await Cliente.findAll({
        include: ['membresias', 'qrs'],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: clientes
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener clientes'
      });
    }
  }

  /**
   * Obtener un cliente por ID
   * GET /api/cliente/:id
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

      const cliente = await Cliente.findByPk(id, {
        include: ['membresias', 'qrs', 'asistencias']
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: cliente
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener cliente'
      });
    }
  }

  /**
   * Actualizar un cliente
   * PUT /api/cliente/:id
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
        peso, 
        telefono, 
        fechaInicio, 
        fechaFin, 
        tipoPago, 
        activo 
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido'
        });
      }

      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const updateData = {
        nombre,
        apellido,
        cedula: cedula !== undefined ? cedula : cliente.cedula,
        email: email !== undefined ? email : cliente.email,
        peso: peso !== undefined ? peso : cliente.peso,
        telefono: telefono !== undefined ? telefono : cliente.telefono,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : cliente.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : cliente.fechaFin,
        tipoPago: tipoPago !== undefined ? tipoPago : cliente.tipoPago,
        activo: activo !== undefined ? activo : cliente.activo
      };

      // Solo actualizar password si se proporciona
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await cliente.update(updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: cliente
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar cliente'
      });
    }
  }

  /**
   * Eliminar un cliente
   * DELETE /api/cliente/:id
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

      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      await cliente.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar cliente'
      });
    }
  }
}

module.exports = new ClienteController();
