const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Membresía
 * Representa la mensualidad activa/inactiva del cliente
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
  tipo: {
    type: DataTypes.ENUM('mensual', 'trimestral', 'semestral', 'anual'),
    allowNull: false
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'membresias',
  timestamps: true,
  underscored: false
});

module.exports = Membresia;
