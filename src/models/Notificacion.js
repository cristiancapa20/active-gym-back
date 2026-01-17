const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Notificación
 * Representa las notificaciones del sistema (membresías por vencer, etc.)
 */
const Notificacion = sequelize.define('Notificacion', {
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
  membresiaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'membresias',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('membresia_por_vencer', 'membresia_vencida', 'qr_por_vencer', 'qr_vencido'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  diasRestantes: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'notificaciones',
  timestamps: true,
  underscored: false
});

module.exports = Notificacion;
