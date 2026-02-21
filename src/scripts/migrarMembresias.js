const { sequelize, PlanMembresia, Membresia, Cliente } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Script de migración para actualizar la estructura de membresías
 * 
 * Este script:
 * 1. Crea la tabla planes_membresia
 * 2. Crea planes por defecto
 * 3. Agrega columnas planId, estado, tipoPago a membresias
 * 4. Migra datos existentes
 * 5. Elimina columnas fechaInicio, fechaFin, tipoPago de clientes
 */

async function migrar() {
  try {
    console.log('🔄 Iniciando migración de membresías...\n');

    // 1. Crear tabla planes_membresia si no existe
    console.log('📋 Creando tabla planes_membresia...');
    const [tablaExiste] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'planes_membresia'
    `);
    
    if (tablaExiste.length === 0) {
      await sequelize.query(`
        CREATE TABLE "planes_membresia" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "nombre" VARCHAR(255) NOT NULL UNIQUE,
          "tipo" VARCHAR(20) NOT NULL UNIQUE CHECK ("tipo" IN ('mensual', 'trimestral', 'semestral', 'anual')),
          "duracionDias" INTEGER NOT NULL,
          "precio" DECIMAL(10,2) NOT NULL DEFAULT 0,
          "activo" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);
      console.log('  ✅ Tabla planes_membresia creada');
    } else {
      console.log('  ℹ️  Tabla planes_membresia ya existe');
    }
    console.log('');

    // 2. Crear planes por defecto si no existen
    console.log('📦 Creando planes por defecto...');
    const planesPorDefecto = [
      { nombre: 'Mensual', tipo: 'mensual', duracionDias: 30, precio: 20, activo: true },
      { nombre: 'Trimestral', tipo: 'trimestral', duracionDias: 90, precio: 60, activo: true },
      { nombre: 'Semestral', tipo: 'semestral', duracionDias: 180, precio: 120, activo: true },
      { nombre: 'Anual', tipo: 'anual', duracionDias: 365, precio: 240, activo: true }
    ];

    for (const planData of planesPorDefecto) {
      const [plan, created] = await PlanMembresia.findOrCreate({
        where: { tipo: planData.tipo },
        defaults: planData
      });
      if (created) {
        console.log(`  ✅ Plan ${planData.nombre} creado`);
      } else {
        console.log(`  ℹ️  Plan ${planData.nombre} ya existe`);
      }
    }
    console.log('');

    // 3. Agregar columnas a membresias si no existen
    console.log('🔧 Actualizando tabla membresias...');
    
    // Verificar si la columna estado existe
    const [resultadoEstado] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'membresias' AND column_name = 'estado'
    `);

    if (resultadoEstado.length === 0) {
      console.log('  ➕ Agregando columna estado...');
      await sequelize.query(`
        ALTER TABLE membresias 
        ADD COLUMN estado VARCHAR(20) DEFAULT 'activa' 
        CHECK (estado IN ('activa', 'vencida', 'cancelada'))
      `);
      console.log('  ✅ Columna estado agregada');
    }

    // Verificar si la columna tipoPago existe
    const [resultadoTipoPago] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'membresias' AND column_name = 'tipoPago'
    `);

    if (resultadoTipoPago.length === 0) {
      console.log('  ➕ Agregando columna tipoPago...');
      await sequelize.query(`
        ALTER TABLE membresias 
        ADD COLUMN "tipoPago" VARCHAR(20) 
        CHECK ("tipoPago" IN ('efectivo', 'tarjeta', 'transferencia', 'otro'))
      `);
      console.log('  ✅ Columna tipoPago agregada');
    }

    // Verificar si la columna planId existe
    const [resultadoPlanId] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'membresias' AND column_name = 'planId'
    `);

    if (resultadoPlanId.length === 0) {
      console.log('  ➕ Agregando columna planId...');
      await sequelize.query(`
        ALTER TABLE membresias 
        ADD COLUMN "planId" UUID 
        REFERENCES planes_membresia(id) ON DELETE SET NULL
      `);
      console.log('  ✅ Columna planId agregada');
    }

    // 4. Migrar datos existentes
    console.log('\n📊 Migrando datos existentes...');
    
    // Actualizar estado basado en activa y fechaFin
    await sequelize.query(`
      UPDATE membresias 
      SET estado = CASE 
        WHEN "activa" = true AND ("fechaFin" IS NULL OR "fechaFin" >= CURRENT_DATE) THEN 'activa'
        WHEN "activa" = true AND "fechaFin" < CURRENT_DATE THEN 'vencida'
        ELSE 'vencida'
      END
    `);
    console.log('  ✅ Estados actualizados');

    // Asignar planId basado en tipo
    const planes = await PlanMembresia.findAll();
    for (const plan of planes) {
      await sequelize.query(`
        UPDATE membresias 
        SET "planId" = :planId 
        WHERE tipo = :tipo AND "planId" IS NULL
      `, {
        replacements: { planId: plan.id, tipo: plan.tipo },
        type: QueryTypes.UPDATE
      });
    }
    console.log('  ✅ PlanId asignado a membresías existentes');

    // Migrar tipoPago de clientes a membresías activas
    await sequelize.query(`
      UPDATE membresias m
      SET "tipoPago" = c."tipoPago"
      FROM clientes c
      WHERE m."clienteId" = c.id 
        AND m."tipoPago" IS NULL 
        AND c."tipoPago" IS NOT NULL
        AND m.estado = 'activa'
    `);
    console.log('  ✅ TipoPago migrado de clientes a membresías');

    // 5. Eliminar columnas de clientes (solo si existen)
    console.log('\n🗑️  Limpiando tabla clientes...');
    
    const columnasCliente = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clientes' 
        AND column_name IN ('fechaInicio', 'fechaFin', 'tipoPago')
    `);

    for (const columna of columnasCliente[0]) {
      console.log(`  ➖ Eliminando columna ${columna.column_name}...`);
      await sequelize.query(`
        ALTER TABLE clientes 
        DROP COLUMN IF EXISTS "${columna.column_name}"
      `);
      console.log(`  ✅ Columna ${columna.column_name} eliminada`);
    }

    // 6. Eliminar columna activa de membresias (ya no se usa)
    const [resultadoActiva] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'membresias' AND column_name = 'activa'
    `);

    if (resultadoActiva.length > 0) {
      console.log('\n🗑️  Eliminando columna activa de membresias...');
      await sequelize.query(`
        ALTER TABLE membresias 
        DROP COLUMN IF EXISTS activa
      `);
      console.log('  ✅ Columna activa eliminada');
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('  - Tabla planes_membresia creada');
    console.log('  - Planes por defecto creados');
    console.log('  - Columnas agregadas a membresias (estado, tipoPago, planId)');
    console.log('  - Datos migrados correctamente');
    console.log('  - Columnas eliminadas de clientes (fechaInicio, fechaFin, tipoPago)');
    console.log('  - Columna activa eliminada de membresias');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  migrar()
    .then(() => {
      console.log('\n✨ Proceso finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrar };
