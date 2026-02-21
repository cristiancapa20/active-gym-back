const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Plan de Membresía
 * Representa los planes de membresía disponibles en el sistema (mensual, trimestral, etc.)
 */
const PlanMembresia = sequelize.define('PlanMembresia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nombre del plan (ej: Mensual, Trimestral, Anual)'
  },
  tipo: {
    type: DataTypes.ENUM('mensual', 'trimestral', 'semestral', 'anual'),
    allowNull: false,
    unique: true,
    comment: 'Tipo de membresía'
  },
  duracionDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duración del plan en días'
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Precio del plan'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el plan está activo y disponible'
  }
}, {
  tableName: 'planes_membresia',
  timestamps: true,
  underscored: false
});

module.exports = PlanMembresia;
