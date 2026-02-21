const { sequelize } = require('../config/database');
const Gym = require('./Gym');
const Admin = require('./Admin');
const Cliente = require('./Cliente');
const Entrenador = require('./Entrenador');
const PlanMembresia = require('./PlanMembresia');
const Membresia = require('./Membresia');
const QR = require('./QR');
const Asistencia = require('./Asistencia');
const Notificacion = require('./Notificacion');
const Configuracion = require('./Configuracion');

// Definir relaciones

// Gym -> Admin (1:N - un gym puede tener múltiples admins)
Gym.hasMany(Admin, { foreignKey: 'gymId', as: 'admins' });
Admin.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });

// Gym -> Cliente (1:N - un gym puede tener múltiples clientes)
Gym.hasMany(Cliente, { foreignKey: 'gymId', as: 'clientes' });
Cliente.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });

// Gym -> Entrenador (1:N - un gym puede tener múltiples entrenadores)
Gym.hasMany(Entrenador, { foreignKey: 'gymId', as: 'entrenadores' });
Entrenador.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });

// Gym -> Configuracion (1:N - un gym puede tener múltiples configuraciones)
Gym.hasMany(Configuracion, { foreignKey: 'gymId', as: 'configuraciones' });
Configuracion.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });

// PlanMembresia -> Membresía (1:N - un plan puede tener múltiples membresías)
PlanMembresia.hasMany(Membresia, { foreignKey: 'planId', as: 'membresias' });
Membresia.belongsTo(PlanMembresia, { foreignKey: 'planId', as: 'plan' });

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

// Cliente -> Notificación (1:N - un cliente puede tener múltiples notificaciones)
Cliente.hasMany(Notificacion, { foreignKey: 'clienteId', as: 'notificaciones' });
Notificacion.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Membresía -> Notificación (1:N - una membresía puede tener múltiples notificaciones)
Membresia.hasMany(Notificacion, { foreignKey: 'membresiaId', as: 'notificaciones' });
Notificacion.belongsTo(Membresia, { foreignKey: 'membresiaId', as: 'membresia' });

module.exports = {
  sequelize,
  Gym,
  Admin,
  Cliente,
  Entrenador,
  PlanMembresia,
  Membresia,
  QR,
  Asistencia,
  Notificacion,
  Configuracion
};
