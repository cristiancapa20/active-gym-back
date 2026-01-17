const bcrypt = require('bcrypt');

/**
 * Utilidades para el manejo de contraseñas
 * Usa bcrypt para hashear y comparar contraseñas
 */

/**
 * Hashea una contraseña en texto plano
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
async function hashPassword(plainPassword) {
  if (!plainPassword) {
    return null;
  }
  
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Compara una contraseña en texto plano con un hash
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
}

module.exports = {
  hashPassword,
  comparePassword
};
