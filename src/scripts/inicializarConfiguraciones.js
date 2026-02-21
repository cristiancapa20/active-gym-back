require('dotenv').config();
const { sequelize, Configuracion } = require('../models');

/**
 * Script para inicializar las configuraciones del sistema
 * Crea las configuraciones por defecto para los módulos
 */
async function inicializarConfiguraciones() {
  try {
    console.log('🔄 Inicializando configuraciones del sistema...');

    // Sincronizar el modelo
    await sequelize.sync();

    // Configuraciones por defecto
    const configuracionesDefault = [
      {
        clave: 'modulo_qr',
        valor: true,
        descripcion: 'Módulo de códigos QR para registro de asistencia',
        activo: true
      },
      {
        clave: 'modulo_notificaciones',
        valor: true,
        descripcion: 'Módulo de notificaciones para membresías próximas a vencer',
        activo: true
      },
      {
        clave: 'modulo_entrenadores',
        valor: true,
        descripcion: 'Módulo de gestión de entrenadores',
        activo: true
      },
      {
        clave: 'modulo_asistencia',
        valor: true,
        descripcion: 'Módulo de registro de asistencia',
        activo: true
      }
    ];

    // Crear o actualizar cada configuración
    for (const config of configuracionesDefault) {
      const [configuracion, created] = await Configuracion.findOrCreate({
        where: { clave: config.clave },
        defaults: config
      });

      if (!created) {
        // Si ya existe, actualizar solo si es necesario
        await configuracion.update({
          descripcion: config.descripcion,
          activo: config.activo
        });
        console.log(`✅ Configuración actualizada: ${config.clave}`);
      } else {
        console.log(`✅ Configuración creada: ${config.clave}`);
      }
    }

    console.log('✅ Configuraciones inicializadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar configuraciones:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarConfiguraciones();
}

module.exports = inicializarConfiguraciones;
