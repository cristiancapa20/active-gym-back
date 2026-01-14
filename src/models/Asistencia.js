const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Asistencia
 * Representa cada entrada/registro de asistencia al gym
 */
const Asistencia = sequelize.define('Asistencia', {
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
  qrId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'qrs',
      key: 'id'
    }
  },
  fechaEntrada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaSalida: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'asistencias',
  timestamps: true,
  underscored: false
});

module.exports = Asistencia;
