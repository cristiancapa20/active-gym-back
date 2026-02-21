const { sequelize } = require('../config/database');
const { Gym } = require('../models');

/**
 * Script para verificar si la tabla gyms existe y crearla si no existe
 * Uso: node src/scripts/verificarTablaGyms.js
 */
(async () => {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');

    // Verificar si la tabla existe
    const [results] = await sequelize.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gyms')"
    );
    
    const tablaExiste = results[0].exists;
    console.log('📊 Tabla gyms existe:', tablaExiste);

    if (!tablaExiste) {
      console.log('📝 Creando tabla gyms...');
      await Gym.sync({ force: false });
      console.log('✅ Tabla gyms creada exitosamente');
    } else {
      console.log('✅ Tabla gyms ya existe');
      
      // Verificar cuántos registros hay
      const count = await Gym.count();
      console.log(`📊 Registros en la tabla: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
