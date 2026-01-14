const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Cliente
 * Representa a la persona que asiste al gym
 */
const Cliente = sequelize.define('Cliente', {
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
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
    // TODO: Hashear password antes de guardar
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Peso en kilogramos'
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de inicio de la membresía actual'
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de fin de la membresía actual'
  },
  tipoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'otro'),
    allowNull: true,
    comment: 'Tipo de pago preferido'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  underscored: false
});

module.exports = Cliente;
