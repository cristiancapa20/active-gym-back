require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { syncDatabase } = require('../config/syncDatabase');
const { desactivarVencidos } = require('../utils/cronJobs');

/**
 * Script para ejecutar manualmente la verificación de membresías y QR vencidos
 * Uso: node src/scripts/verificarVencidos.js
 */
async function ejecutarVerificacion() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos (asegurar que las tablas existan)
    console.log('🔄 Sincronizando modelos...');
    await syncDatabase(false);

    // Ejecutar verificación
    console.log('🔍 Ejecutando verificación de vencidos...');
    await desactivarVencidos();

    console.log('✅ Verificación completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
ejecutarVerificacion();
