const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Membresía
 * Representa cada período de membresía del cliente (historial completo)
 */
const Membresia = sequelize.define('Membresia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clienteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'planes_membresia',
      key: 'id'
    },
    comment: 'Referencia al plan de membresía utilizado'
  },
  tipo: {
    type: DataTypes.ENUM('mensual', 'trimestral', 'semestral', 'anual'),
    allowNull: false,
    comment: 'Tipo de membresía (mantenido para compatibilidad)'
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de fin de la membresía'
  },
  estado: {
    type: DataTypes.ENUM('activa', 'vencida', 'cancelada'),
    allowNull: false,
    defaultValue: 'activa',
    comment: 'Estado de la membresía'
  },
  tipoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'otro'),
    allowNull: true,
    comment: 'Tipo de pago utilizado para esta membresía'
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Precio pagado por esta membresía (puede diferir del plan si hubo descuento)'
  }
}, {
  tableName: 'membresias',
  timestamps: true,
  underscored: false
});

module.exports = Membresia;
