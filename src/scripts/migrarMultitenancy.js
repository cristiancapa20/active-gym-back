require('dotenv').config();
const { sequelize } = require('../config/database');
const { Gym, Configuracion } = require('../models');

/**
 * Script para migrar la base de datos a multitenancy
 * 1. Crea la tabla gyms si no existe
 * 2. Crea un gimnasio por defecto
 * 3. Agrega las columnas gymId a las tablas necesarias (sin foreign key primero)
 * 4. Asocia todos los datos existentes al gimnasio por defecto
 * 5. Agrega las foreign key constraints
 */
async function migrarMultitenancy() {
  try {
    console.log('🔄 Iniciando migración a multitenancy...');

    const queryInterface = sequelize.getQueryInterface();

    // PASO 1: Verificar si la tabla gyms existe, si no, crearla
    console.log('\n📝 PASO 1: Verificando si la tabla gyms existe...');
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'gyms'
      )
    `);
    
    if (!tableExists[0].exists) {
      console.log('📝 La tabla gyms no existe, creándola...');
      await Gym.sync({ force: false });
      console.log('✅ Tabla gyms creada');
    } else {
      console.log('✅ La tabla gyms ya existe');
    }

    // PASO 2: Crear gym por defecto si no existe
    console.log('\n📝 PASO 2: Verificando si existe un gym por defecto...');
    let gymPorDefecto = await Gym.findOne({ where: { codigo: 'GYM001' } });
    
    if (!gymPorDefecto) {
      console.log('📝 Creando gym por defecto para datos existentes...');
      gymPorDefecto = await Gym.create({
        nombre: 'Gimnasio Principal',
        codigo: 'GYM001',
        activo: true
      });
      console.log(`✅ Gym por defecto creado con ID: ${gymPorDefecto.id}`);
    } else {
      console.log(`✅ Gym por defecto ya existe con ID: ${gymPorDefecto.id}`);
    }

    const gymId = gymPorDefecto.id;

    // PASO 3: Agregar gymId a admins (nullable porque super_admin no tiene gym)
    console.log('\n📝 PASO 3: Agregando columna gymId a tabla admins...');
    try {
      // Primero verificar si la columna ya existe
      const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'admins' 
          AND column_name = 'gymId'
        )
      `);

      if (!columnExists[0].exists) {
        await queryInterface.addColumn('admins', 'gymId', {
          type: sequelize.Sequelize.UUID,
          allowNull: true
        });
        console.log('✅ Columna gymId agregada a admins');
      } else {
        console.log('⚠️  La columna gymId ya existe en admins');
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  La columna gymId ya existe en admins');
      } else {
        throw error;
      }
    }

    // PASO 4: Agregar gymId a clientes
    console.log('\n📝 PASO 4: Agregando columna gymId a tabla clientes...');
    try {
      const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'clientes' 
          AND column_name = 'gymId'
        )
      `);

      if (!columnExists[0].exists) {
        await queryInterface.addColumn('clientes', 'gymId', {
          type: sequelize.Sequelize.UUID,
          allowNull: true // Temporalmente nullable para migración
        });
        console.log('✅ Columna gymId agregada a clientes');
      } else {
        console.log('⚠️  La columna gymId ya existe en clientes');
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  La columna gymId ya existe en clientes');
      } else {
        throw error;
      }
    }

    // PASO 5: Agregar gymId a entrenadores
    console.log('\n📝 PASO 5: Agregando columna gymId a tabla entrenadores...');
    try {
      const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'entrenadores' 
          AND column_name = 'gymId'
        )
      `);

      if (!columnExists[0].exists) {
        await queryInterface.addColumn('entrenadores', 'gymId', {
          type: sequelize.Sequelize.UUID,
          allowNull: true // Temporalmente nullable para migración
        });
        console.log('✅ Columna gymId agregada a entrenadores');
      } else {
        console.log('⚠️  La columna gymId ya existe en entrenadores');
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  La columna gymId ya existe en entrenadores');
      } else {
        throw error;
      }
    }

    // PASO 6: Agregar gymId a configuraciones si no existe
    console.log('\n📝 PASO 6: Verificando columna gymId en tabla configuraciones...');
    try {
      const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'configuraciones' 
          AND column_name = 'gymId'
        )
      `);

      if (!columnExists[0].exists) {
        await queryInterface.addColumn('configuraciones', 'gymId', {
          type: sequelize.Sequelize.UUID,
          allowNull: true
        });
        console.log('✅ Columna gymId agregada a configuraciones');
      } else {
        console.log('⚠️  La columna gymId ya existe en configuraciones');
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  La columna gymId ya existe en configuraciones');
      } else {
        console.log('⚠️  Error al agregar gymId a configuraciones (puede que la tabla no exista aún):', error.message);
      }
    }

    // PASO 7: Asignar todos los datos existentes al gym por defecto
    console.log('\n📝 PASO 7: Asignando datos existentes al gym por defecto...');
    
    // Verificar cuántos registros hay sin gym
    const [clientesCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM clientes WHERE "gymId" IS NULL
    `);
    const clientesSinGym = parseInt(clientesCount[0].count);

    const [entrenadoresCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM entrenadores WHERE "gymId" IS NULL
    `);
    const entrenadoresSinGym = parseInt(entrenadoresCount[0].count);

    const [adminsCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM admins WHERE "gymId" IS NULL AND (rol IS NULL OR rol != 'super_admin')
    `);
    const adminsSinGym = parseInt(adminsCount[0].count);

    if (clientesSinGym > 0 || entrenadoresSinGym > 0 || adminsSinGym > 0) {
      console.log(`📊 Datos sin gym asignado:`);
      console.log(`   - Clientes: ${clientesSinGym}`);
      console.log(`   - Entrenadores: ${entrenadoresSinGym}`);
      console.log(`   - Admins: ${adminsSinGym}`);

      // Asignar todos los clientes sin gym al gym por defecto
      if (clientesSinGym > 0) {
        await sequelize.query(`
          UPDATE clientes SET "gymId" = '${gymId}' WHERE "gymId" IS NULL
        `);
        console.log('✅ Clientes asignados al gym por defecto');
      }

      // Asignar todos los entrenadores sin gym al gym por defecto
      if (entrenadoresSinGym > 0) {
        await sequelize.query(`
          UPDATE entrenadores SET "gymId" = '${gymId}' WHERE "gymId" IS NULL
        `);
        console.log('✅ Entrenadores asignados al gym por defecto');
      }

      // Asignar todos los admins (no super_admin) sin gym al gym por defecto
      if (adminsSinGym > 0) {
        await sequelize.query(`
          UPDATE admins SET "gymId" = '${gymId}' WHERE "gymId" IS NULL AND (rol IS NULL OR rol != 'super_admin')
        `);
        console.log('✅ Admins asignados al gym por defecto');
      }

      // Asignar configuraciones sin gym al gym por defecto
      try {
        const [configsCount] = await sequelize.query(`
          SELECT COUNT(*) as count FROM configuraciones WHERE "gymId" IS NULL
        `);
        const configsSinGym = parseInt(configsCount[0].count);
        
        if (configsSinGym > 0) {
          await sequelize.query(`
            UPDATE configuraciones SET "gymId" = '${gymId}' WHERE "gymId" IS NULL
          `);
          console.log('✅ Configuraciones asignadas al gym por defecto');
        }
      } catch (error) {
        console.log('⚠️  No se pudo asignar configuraciones (puede que la tabla no exista):', error.message);
      }
    } else {
      console.log('✅ Todos los datos ya tienen gym asignado');
    }

    // PASO 8: Agregar foreign key constraints (opcional, pero recomendado)
    console.log('\n📝 PASO 8: Agregando foreign key constraints...');
    
    // Agregar FK a admins
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'admins_gymId_fkey'
          ) THEN
            ALTER TABLE admins 
            ADD CONSTRAINT admins_gymId_fkey 
            FOREIGN KEY ("gymId") REFERENCES gyms(id) 
            ON UPDATE CASCADE ON DELETE SET NULL;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key agregada a admins');
    } catch (error) {
      console.log('⚠️  No se pudo agregar FK a admins:', error.message);
    }

    // Agregar FK a clientes
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'clientes_gymId_fkey'
          ) THEN
            ALTER TABLE clientes 
            ADD CONSTRAINT clientes_gymId_fkey 
            FOREIGN KEY ("gymId") REFERENCES gyms(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key agregada a clientes');
    } catch (error) {
      console.log('⚠️  No se pudo agregar FK a clientes:', error.message);
    }

    // Agregar FK a entrenadores
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'entrenadores_gymId_fkey'
          ) THEN
            ALTER TABLE entrenadores 
            ADD CONSTRAINT entrenadores_gymId_fkey 
            FOREIGN KEY ("gymId") REFERENCES gyms(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key agregada a entrenadores');
    } catch (error) {
      console.log('⚠️  No se pudo agregar FK a entrenadores:', error.message);
    }

    // PASO 9: Hacer gymId NOT NULL en clientes y entrenadores (opcional)
    console.log('\n📝 PASO 9: Haciendo gymId NOT NULL donde sea necesario...');
    
    // Verificar si hay valores NULL antes de hacer NOT NULL
    const [clientesNull] = await sequelize.query(`
      SELECT COUNT(*) as count FROM clientes WHERE "gymId" IS NULL
    `);
    if (parseInt(clientesNull[0].count) === 0) {
      try {
        await sequelize.query(`
          ALTER TABLE clientes 
          ALTER COLUMN "gymId" SET NOT NULL
        `);
        console.log('✅ gymId es ahora NOT NULL en clientes');
      } catch (error) {
        console.log('⚠️  No se pudo hacer gymId NOT NULL en clientes:', error.message);
      }
    } else {
      console.log('⚠️  Hay clientes sin gymId, no se puede hacer NOT NULL');
    }

    const [entrenadoresNull] = await sequelize.query(`
      SELECT COUNT(*) as count FROM entrenadores WHERE "gymId" IS NULL
    `);
    if (parseInt(entrenadoresNull[0].count) === 0) {
      try {
        await sequelize.query(`
          ALTER TABLE entrenadores 
          ALTER COLUMN "gymId" SET NOT NULL
        `);
        console.log('✅ gymId es ahora NOT NULL en entrenadores');
      } catch (error) {
        console.log('⚠️  No se pudo hacer gymId NOT NULL en entrenadores:', error.message);
      }
    } else {
      console.log('⚠️  Hay entrenadores sin gymId, no se puede hacer NOT NULL');
    }

    console.log('\n✅ Migración a multitenancy completada exitosamente');
    console.log(`\n📋 Resumen:`);
    console.log(`   - Gym por defecto: ${gymPorDefecto.nombre} (${gymPorDefecto.codigo})`);
    console.log(`   - ID del gym: ${gymId}`);
    console.log(`   - Todos los datos existentes han sido asociados al gym por defecto`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrarMultitenancy();
}

module.exports = migrarMultitenancy;
