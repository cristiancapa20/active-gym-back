require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { Admin } = require('../models');
const { syncDatabase } = require('../config/syncDatabase');

/**
 * Script para crear un administrador inicial
 * Uso: node src/scripts/createAdmin.js
 */
async function createAdmin() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos (crear tablas si no existen)
    console.log('🔄 Sincronizando modelos...');
    await syncDatabase(false);

    // Verificar si ya existe un admin
    const adminExistente = await Admin.findOne({
      where: { email: 'admin@gym.com' }
    });

    if (adminExistente) {
      console.log('⚠️  Ya existe un administrador con el email admin@gym.com');
      console.log('   Si deseas crear otro, modifica el email en este script');
      process.exit(0);
    }

    // Crear admin por defecto
    console.log('👨‍💼 Creando administrador inicial...');
    const admin = await Admin.create({
      nombre: 'Administrador',
      email: 'admin@gym.com',
      password: 'admin123', // TODO: Hashear con bcrypt en producción
      rol: 'admin',
      activo: true
    });

    console.log('✅ Administrador creado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('   Email: admin@gym.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    console.log('   y hashea las contraseñas en producción!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear administrador:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
createAdmin();
