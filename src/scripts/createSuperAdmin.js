require('dotenv').config();
const { sequelize, Admin } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * Script para crear un usuario super administrador
 */
async function createSuperAdmin() {
  try {
    console.log('🔄 Creando super administrador...');

    // Sincronizar el modelo
    await sequelize.sync();

    // Obtener datos del superadmin desde variables de entorno o usar valores por defecto
    const nombre = process.env.SUPER_ADMIN_NOMBRE || 'Super Admin';
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@activegym.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

    // Verificar si ya existe un super_admin
    const superAdminExistente = await Admin.findOne({
      where: { rol: 'super_admin' }
    });

    if (superAdminExistente) {
      console.log('⚠️  Ya existe un super administrador en el sistema');
      console.log(`   Email: ${superAdminExistente.email}`);
      console.log('   Si deseas crear uno nuevo, elimina el existente primero.');
      process.exit(0);
    }

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Crear super admin
    const superAdmin = await Admin.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'super_admin',
      gymId: null, // Super admin no pertenece a ningún gym
      activo: true
    });

    console.log('✅ Super administrador creado exitosamente');
    console.log(`   Nombre: ${superAdmin.nombre}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${password}`);
    console.log('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear super administrador:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin;
