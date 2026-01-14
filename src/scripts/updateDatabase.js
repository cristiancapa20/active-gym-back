require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { syncDatabase } = require('../config/syncDatabase');

/**
 * Script para actualizar la base de datos
 * Opción 1: Recrear todas las tablas (BORRA TODOS LOS DATOS)
 * Opción 2: Agregar solo las columnas faltantes (MANTIENE LOS DATOS)
 * 
 * Uso: 
 *   node src/scripts/updateDatabase.js --force  (recrea todo, borra datos)
 *   node src/scripts/updateDatabase.js           (solo sincroniza, no borra)
 */
async function updateDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    const force = process.argv.includes('--force');
    
    if (force) {
      console.log('⚠️  ADVERTENCIA: Se recrearán todas las tablas y se perderán todos los datos!');
      console.log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await syncDatabase(force);
    
    if (force) {
      console.log('\n✅ Base de datos recreada exitosamente');
      console.log('   Todas las tablas fueron recreadas con los nuevos campos');
    } else {
      console.log('\n✅ Base de datos sincronizada');
      console.log('   Nota: Si faltan columnas, ejecuta con --force para recrear las tablas');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error.message);
    process.exit(1);
  }
}

updateDatabase();
