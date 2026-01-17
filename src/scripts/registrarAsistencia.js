require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { syncDatabase } = require('../config/syncDatabase');
const { Cliente, QR, Asistencia } = require('../models');

/**
 * Script para registrar asistencia a un cliente
 * Uso: 
 *   node src/scripts/registrarAsistencia.js --clienteId=<UUID>
 *   node src/scripts/registrarAsistencia.js --cedula=<cedula>
 *   node src/scripts/registrarAsistencia.js --cedula=<cedula> --fecha="2024-01-15 10:30:00"
 */
async function registrarAsistencia() {
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

    // Obtener argumentos de línea de comandos
    const args = process.argv.slice(2);
    const clienteId = args.find(arg => arg.startsWith('--clienteId='))?.split('=')[1];
    const cedula = args.find(arg => arg.startsWith('--cedula='))?.split('=')[1];
    const fechaArg = args.find(arg => arg.startsWith('--fecha='))?.split('=')[1];

    // Validar que se proporcione clienteId o cedula
    if (!clienteId && !cedula) {
      console.error('❌ Error: Debes proporcionar --clienteId=<UUID> o --cedula=<cedula>');
      console.log('\nEjemplos de uso:');
      console.log('  node src/scripts/registrarAsistencia.js --clienteId=123e4567-e89b-12d3-a456-426614174000');
      console.log('  node src/scripts/registrarAsistencia.js --cedula=1105650376');
      console.log('  node src/scripts/registrarAsistencia.js --cedula=1234567890 --fecha="2024-01-15 10:30:00"');
      process.exit(1);
    }

    // Buscar cliente
    let cliente;
    if (clienteId) {
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        throw new Error(`Cliente con ID ${clienteId} no encontrado`);
      }
    } else {
      cliente = await Cliente.findOne({ where: { cedula } });
      if (!cliente) {
        throw new Error(`Cliente con cédula ${cedula} no encontrado`);
      }
    }

    console.log(`\n✅ Cliente encontrado:`);
    console.log(`   Nombre: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`   Cédula: ${cliente.cedula}`);
    console.log(`   Email: ${cliente.email}`);
    console.log(`   Activo: ${cliente.activo ? 'Sí' : 'No'}`);

    // Buscar un QR activo del cliente (opcional)
    let qrActivo = null;
    const qrs = await QR.findAll({
      where: {
        clienteId: cliente.id,
        activo: true
      },
      include: [
        { model: require('../models/Membresia'), as: 'membresia', required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (qrs.length > 0) {
      qrActivo = qrs[0];
      console.log(`\n📱 QR activo encontrado:`);
      console.log(`   ID: ${qrActivo.id}`);
      console.log(`   Código: ${qrActivo.codigo}`);
      if (qrActivo.membresia) {
        console.log(`   Membresía: ${qrActivo.membresia.tipo} (${qrActivo.membresia.activa ? 'Activa' : 'Inactiva'})`);
      }
    } else {
      console.log(`\n⚠️  No se encontró un QR activo para este cliente`);
    }

    // Determinar fecha
    const fecha = fechaArg ? new Date(fechaArg) : new Date();
    console.log(`\n📅 Fecha de asistencia: ${fecha.toLocaleString('es-ES')}`);

    // Registrar asistencia
    console.log('\n🔄 Registrando asistencia...');
    const nuevaAsistencia = await Asistencia.create({
      clienteId: cliente.id,
      qrId: qrActivo ? qrActivo.id : null,
      fecha: fecha
    });

    // Cargar relaciones para mostrar información completa
    const asistenciaCompleta = await Asistencia.findByPk(nuevaAsistencia.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: QR, as: 'qr', required: false }
      ]
    });

    console.log('\n✅ Asistencia registrada exitosamente:');
    console.log(`   ID: ${asistenciaCompleta.id}`);
    console.log(`   Cliente: ${asistenciaCompleta.cliente.nombre} ${asistenciaCompleta.cliente.apellido}`);
    console.log(`   Fecha: ${new Date(asistenciaCompleta.fecha).toLocaleString('es-ES')}`);
    if (asistenciaCompleta.qr) {
      console.log(`   QR: ${asistenciaCompleta.qr.codigo}`);
    }
    console.log(`   Creada: ${asistenciaCompleta.createdAt.toLocaleString('es-ES')}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al registrar asistencia:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
registrarAsistencia();
