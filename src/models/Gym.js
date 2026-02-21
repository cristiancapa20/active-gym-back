const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Gym
 * Representa un gimnasio en el sistema multitenant
 */
const Gym = sequelize.define('Gym', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del gimnasio'
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Código único del gimnasio (usado para identificación)'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección del gimnasio'
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email de contacto'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el gimnasio está activo'
  }
}, {
  tableName: 'gyms',
  timestamps: true,
  underscored: false
});

module.exports = Gym;
