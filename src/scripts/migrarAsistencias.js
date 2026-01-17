require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');

/**
 * Script para migrar la tabla asistencias de fechaEntrada/fechaSalida a fecha
 * Uso: node src/scripts/migrarAsistencias.js
 */
async function migrarAsistencias() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Verificar si la tabla existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'asistencias'
      );
    `);

    if (!results[0].exists) {
      console.log('⚠️  La tabla asistencias no existe. Se creará automáticamente al sincronizar modelos.');
      process.exit(0);
    }

    // Verificar qué columnas existen
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'asistencias' 
      AND table_schema = 'public';
    `);

    const columnNames = columns.map(col => col.column_name);
    console.log('\n📋 Columnas actuales en asistencias:', columnNames.join(', '));

    const tieneFechaEntrada = columnNames.includes('fechaEntrada');
    const tieneFechaSalida = columnNames.includes('fechaSalida');
    const tieneFecha = columnNames.includes('fecha');

    // Si ya tiene fecha y no tiene las antiguas, no hay nada que hacer
    if (tieneFecha && !tieneFechaEntrada && !tieneFechaSalida) {
      console.log('\n✅ La tabla ya está migrada. No se requiere acción.');
      process.exit(0);
    }

    // Agregar columna fecha si no existe
    if (!tieneFecha) {
      console.log('\n🔄 Agregando columna "fecha"...');
      await sequelize.query(`
        ALTER TABLE asistencias 
        ADD COLUMN IF NOT EXISTS fecha TIMESTAMP DEFAULT NOW();
      `);
      console.log('✅ Columna "fecha" agregada');
    }

    // Si existe fechaEntrada, copiar datos a fecha
    if (tieneFechaEntrada) {
      console.log('\n🔄 Copiando datos de fechaEntrada a fecha...');
      const [updateResult] = await sequelize.query(`
        UPDATE asistencias 
        SET fecha = "fechaEntrada" 
        WHERE fecha IS NULL OR fecha = NOW();
      `);
      console.log(`✅ Datos copiados: ${updateResult.rowCount || 0} registros actualizados`);
    }

    // Eliminar columnas antiguas si existen
    if (tieneFechaEntrada) {
      console.log('\n🔄 Eliminando columna "fechaEntrada"...');
      await sequelize.query(`
        ALTER TABLE asistencias 
        DROP COLUMN IF EXISTS "fechaEntrada";
      `);
      console.log('✅ Columna "fechaEntrada" eliminada');
    }

    if (tieneFechaSalida) {
      console.log('\n🔄 Eliminando columna "fechaSalida"...');
      await sequelize.query(`
        ALTER TABLE asistencias 
        DROP COLUMN IF EXISTS "fechaSalida";
      `);
      console.log('✅ Columna "fechaSalida" eliminada');
    }

    // Verificar resultado final
    const [finalColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'asistencias' 
      AND table_schema = 'public'
      ORDER BY column_name;
    `);

    console.log('\n✅ Migración completada exitosamente');
    console.log('📋 Columnas finales en asistencias:', finalColumns.map(col => col.column_name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al migrar asistencias:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
migrarAsistencias();
