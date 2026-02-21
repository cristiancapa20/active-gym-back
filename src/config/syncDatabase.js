const { sequelize, testConnection } = require('./database');
// Importar todos los modelos para que se sincronicen
const { Gym, Admin, Cliente, Entrenador, PlanMembresia, Membresia, QR, Asistencia, Notificacion, Configuracion } = require('../models');

/**
 * Sincronizar modelos con la base de datos
 * Crea las tablas si no existen
 * @param {boolean} force - Si es true, elimina y recrea todas las tablas (CUIDADO: borra datos)
 */
const syncDatabase = async (force = false) => {
  try {
    // Probar conexión primero
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos (crear tablas si no existen)
    // Si force es true, elimina y recrea todas las tablas
    await sequelize.sync({ force });
    
    if (force) {
      console.log('🔄 Base de datos sincronizada (modo force - todas las tablas fueron recreadas)');
    } else {
      console.log('✅ Base de datos sincronizada correctamente');
      console.log('   Nota: Si agregaste nuevos campos, es posible que necesites recrear las tablas');
      console.log('   Ejecuta: syncDatabase(true) para recrear todas las tablas (¡CUIDADO: borra datos!)');
    }

    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

module.exports = { syncDatabase };
