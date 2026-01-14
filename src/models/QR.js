const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo QR
 * Representa el código de acceso del cliente (expira y depende de la membresía)
 */
const QR = sequelize.define('QR', {
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
    allowNull: false,
    references: {
      model: 'membresias',
      key: 'id'
    }
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'qrs',
  timestamps: true,
  underscored: false
});

module.exports = QR;
