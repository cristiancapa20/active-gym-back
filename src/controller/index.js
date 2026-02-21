/**
 * Exportación centralizada de todos los controllers
 */
const GymController = require('./GymController');
const AdminController = require('./AdminController');
const ClienteController = require('./ClienteController');
const PlanMembresiaController = require('./PlanMembresiaController');
const MembresiaController = require('./MembresiaController');
const QRController = require('./QRController');
const AsistenciaController = require('./AsistenciaController');
const AuthController = require('./AuthController');
const EntrenadorController = require('./EntrenadorController');
const NotificacionController = require('./NotificacionController');
const ConfiguracionController = require('./ConfiguracionController');

module.exports = {
  GymController,
  AdminController,
  ClienteController,
  PlanMembresiaController,
  MembresiaController,
  QRController,
  AsistenciaController,
  AuthController,
  EntrenadorController,
  NotificacionController,
  ConfiguracionController
};
