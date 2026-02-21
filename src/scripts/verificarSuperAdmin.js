require('dotenv').config();
const { sequelize, Admin } = require('../models');

/**
 * Script para verificar si existe un superadmin y mostrar sus credenciales
 */
async function verificarSuperAdmin() {
  try {
    console.log('🔍 Verificando super administrador...');

    // Sincronizar el modelo
    await sequelize.sync();

    // Buscar superadmin
    const superAdmin = await Admin.findOne({
      where: { rol: 'super_admin' },
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'gymId', 'createdAt']
    });

    if (superAdmin) {
      console.log('✅ Super administrador encontrado:');
      console.log(`   ID: ${superAdmin.id}`);
      console.log(`   Nombre: ${superAdmin.nombre}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Rol: ${superAdmin.rol}`);
      console.log(`   Activo: ${superAdmin.activo}`);
      console.log(`   GymId: ${superAdmin.gymId || 'null (correcto para super_admin)'}`);
      console.log(`   Creado: ${superAdmin.createdAt}`);
      console.log('\n📝 Credenciales por defecto:');
      console.log(`   Email: superadmin@activegym.com`);
      console.log(`   Password: superadmin123`);
      console.log('\n⚠️  Si cambiaste la contraseña, usa la que configuraste.');
    } else {
      console.log('❌ No se encontró ningún super administrador');
      console.log('\n💡 Para crear uno, ejecuta:');
      console.log('   npm run create-superadmin');
      console.log('\n⚠️  IMPORTANTE: Asegúrate de ejecutar primero la migración:');
      console.log('   npm run migrar-multitenancy');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar super administrador:', error);
    if (error.message.includes('gymId')) {
      console.log('\n💡 Parece que falta la columna gymId. Ejecuta primero:');
      console.log('   npm run migrar-multitenancy');
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarSuperAdmin();
}

module.exports = verificarSuperAdmin;
