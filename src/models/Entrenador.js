const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Entrenador
 * Representa a los entrenadores del gym
 * Similar a Cliente pero sin peso ni membresías
 */
const Entrenador = sequelize.define('Entrenador', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Especialidad del entrenador (ej: fuerza, cardio, yoga, etc.)'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'entrenadores',
  timestamps: true,
  underscored: false
});

module.exports = Entrenador;
