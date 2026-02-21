const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Admin / Usuario del Sistema
 * Representa al administrador que gestiona el gym
 */
const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
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
  rol: {
    type: DataTypes.ENUM('admin', 'super_admin'),
    defaultValue: 'admin'
  },
  gymId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'gyms',
      key: 'id'
    },
    comment: 'ID del gimnasio al que pertenece (null para super_admin)'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'admins',
  timestamps: true,
  underscored: false
});

module.exports = Admin;
