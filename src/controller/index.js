/**
 * Exportación centralizada de todos los controllers
 */
const AdminController = require('./AdminController');
const ClienteController = require('./ClienteController');
const MembresiaController = require('./MembresiaController');
const QRController = require('./QRController');
const AsistenciaController = require('./AsistenciaController');
const AuthController = require('./AuthController');

module.exports = {
  AdminController,
  ClienteController,
  MembresiaController,
  QRController,
  AsistenciaController,
  AuthController
};
