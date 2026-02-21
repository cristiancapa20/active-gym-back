const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Configuracion
 * Almacena la configuración del sistema, incluyendo el estado de los módulos
 */
const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  gymId: {
    type: DataTypes.UUID,
    allowNull: true, // Temporalmente nullable para migración, luego se puede cambiar a false
    references: {
      model: 'gyms',
      key: 'id'
    },
    comment: 'ID del gimnasio al que pertenece esta configuración'
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Clave única de la configuración (ej: modulo_qr, modulo_notificaciones)'
  },
  valor: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Valor de la configuración (puede ser objeto, array, boolean, etc.)'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de qué hace esta configuración'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la configuración está activa'
  }
}, {
  tableName: 'configuraciones',
  timestamps: true,
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: ['gymId', 'clave']
    }
  ]
});

module.exports = Configuracion;
