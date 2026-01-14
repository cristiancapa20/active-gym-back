const { sequelize } = require('../config/database');
const Admin = require('./Admin');
const Cliente = require('./Cliente');
const Membresia = require('./Membresia');
const QR = require('./QR');
const Asistencia = require('./Asistencia');

// Definir relaciones

// Cliente -> Membresía (1:N - un cliente puede tener múltiples membresías)
Cliente.hasMany(Membresia, { foreignKey: 'clienteId', as: 'membresias' });
Membresia.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Cliente -> QR (1:N - un cliente puede tener múltiples QRs)
Cliente.hasMany(QR, { foreignKey: 'clienteId', as: 'qrs' });
QR.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Membresía -> QR (1:N - una membresía puede tener múltiples QRs)
Membresia.hasMany(QR, { foreignKey: 'membresiaId', as: 'qrs' });
QR.belongsTo(Membresia, { foreignKey: 'membresiaId', as: 'membresia' });

// Cliente -> Asistencia (1:N - un cliente puede tener múltiples asistencias)
Cliente.hasMany(Asistencia, { foreignKey: 'clienteId', as: 'asistencias' });
Asistencia.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// QR -> Asistencia (1:N - un QR puede tener múltiples asistencias)
QR.hasMany(Asistencia, { foreignKey: 'qrId', as: 'asistencias' });
Asistencia.belongsTo(QR, { foreignKey: 'qrId', as: 'qr' });

module.exports = {
  sequelize,
  Admin,
  Cliente,
  Membresia,
  QR,
  Asistencia
};
