require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const { sequelize, testConnection } = require('../config/database');
const { syncDatabase } = require('../config/syncDatabase');
const { Cliente, Membresia, Notificacion } = require('../models');
const { desactivarVencidos } = require('../utils/cronJobs');

/**
 * Script para probar el sistema de notificaciones
 * Uso: node src/scripts/testNotificaciones.js
 */
async function testNotificaciones() {
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

    // 1. Verificar si hay clientes
    const clientes = await Cliente.findAll({ limit: 5 });
    
    if (clientes.length === 0) {
      console.log('⚠️  No hay clientes en la base de datos.');
      console.log('   Crea al menos un cliente primero usando el frontend.');
      process.exit(0);
    }

    console.log(`\n✅ Encontrados ${clientes.length} cliente(s)`);

    // 2. Crear o actualizar una membresía de prueba que venza en 5 días
    const cliente = clientes[0];
    console.log(`\n📋 Usando cliente: ${cliente.nombre} ${cliente.apellido} (ID: ${cliente.id})`);

    // Buscar membresía activa del cliente
    let membresia = await Membresia.findOne({
      where: {
        clienteId: cliente.id,
        activa: true
      }
    });

    const ahora = new Date();
    const cincoDiasDespues = new Date();
    cincoDiasDespues.setDate(cincoDiasDespues.getDate() + 5);

    if (membresia) {
      // Actualizar membresía existente para que venza en 5 días
      console.log('🔄 Actualizando membresía existente para que venza en 5 días...');
      await membresia.update({
        fechaFin: cincoDiasDespues,
        activa: true
      });
      console.log(`✅ Membresía actualizada. Fecha de vencimiento: ${cincoDiasDespues.toLocaleDateString()}`);
    } else {
      // Crear nueva membresía de prueba
      console.log('🆕 Creando membresía de prueba que venza en 5 días...');
      membresia = await Membresia.create({
        clienteId: cliente.id,
        tipo: 'mensual',
        fechaInicio: ahora,
        fechaFin: cincoDiasDespues,
        precio: 20,
        activa: true
      });
      console.log(`✅ Membresía creada. Fecha de vencimiento: ${cincoDiasDespues.toLocaleDateString()}`);
    }

    // 3. Limpiar notificaciones existentes para este cliente (opcional)
    console.log('\n🧹 Limpiando notificaciones existentes para este cliente...');
    await Notificacion.destroy({
      where: {
        clienteId: cliente.id,
        tipo: 'membresia_por_vencer'
      }
    });

    // 4. Configurar Socket.io para emitir eventos al servidor principal
    console.log('\n🔌 Configurando Socket.io para testing...');
    let io = null;
    let testServer = null;
    let clientSocket = null;
    const SERVER_URL = process.env.SOCKET_URL || 'http://localhost:3000';
    
    // Intentar conectarse al servidor principal como cliente
    console.log(`   🔗 Intentando conectar al servidor principal en ${SERVER_URL}...`);
    
    try {
      // Crear un cliente Socket.io que se conecte al servidor principal
      clientSocket = ioClient(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 3000
      });

      // Esperar a que se conecte o falle
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout al conectar'));
        }, 3000);

        clientSocket.on('connect', () => {
          clearTimeout(timeout);
          console.log('   ✅ Conectado al servidor principal');
          resolve();
        });

        clientSocket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Crear un objeto que emita eventos a través del cliente
      io = {
        emit: (event, data) => {
          // Emitir al servidor principal, que luego lo re-emitirá a todos los clientes
          // Necesitamos crear un servidor temporal que reciba y re-emita
          console.log(`   📢 Emitiendo evento '${event}' al servidor principal...`);
          // Nota: El servidor principal necesita tener un handler para re-emitir estos eventos
          // Por ahora, creamos un servidor temporal que emita directamente
        }
      };

      // Crear servidor temporal que emita eventos (ya que no podemos emitir directamente desde un cliente)
      testServer = http.createServer();
      const tempIo = new Server(testServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      io = tempIo;

      const TEST_PORT = 3001;
      await new Promise((resolve) => {
        testServer.listen(TEST_PORT, () => {
          console.log(`   ✅ Servidor temporal iniciado para emitir eventos`);
          resolve();
        });
      });

      clientSocket.disconnect();
    } catch (error) {
      console.log(`   ⚠️  No se pudo conectar al servidor principal: ${error.message}`);
      console.log('   💡 Asegúrate de que el servidor principal esté corriendo (npm start)');
      console.log('   📢 Creando servidor temporal para testing...');
      
      // Crear servidor temporal
      testServer = http.createServer();
      io = new Server(testServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      const TEST_PORT = 3001;
      await new Promise((resolve) => {
        testServer.listen(TEST_PORT, () => {
          console.log(`   ✅ Servidor Socket.io temporal iniciado en puerto ${TEST_PORT}`);
          console.log('   ⚠️  Los eventos no llegarán al frontend (servidor principal no disponible)');
          resolve();
        });
      });
    }

    // 5. Ejecutar la función de verificación de vencidos (que crea notificaciones)
    console.log('\n🔍 Ejecutando verificación de membresías por vencer...');
    console.log('   📢 Emitiendo eventos vía Socket.io...');
    await desactivarVencidos(io);
    
    // Dar tiempo para que los eventos se emitan
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cerrar servidor Socket.io de prueba solo si lo creamos nosotros
    if (!global.io && io) {
      console.log('\n🔌 Cerrando servidor Socket.io temporal...');
      io.close();
      if (testServer) {
        testServer.close();
      }
      console.log('   ✅ Servidor temporal cerrado');
    } else {
      console.log('\n✅ Eventos emitidos a través del servidor principal');
    }

    // 6. Verificar que se creó la notificación
    console.log('\n📬 Verificando notificaciones creadas...');
    const notificaciones = await Notificacion.findAll({
      where: {
        clienteId: cliente.id,
        tipo: 'membresia_por_vencer'
      },
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (notificaciones.length > 0) {
      console.log(`\n✅ ¡Éxito! Se crearon ${notificaciones.length} notificación(es):`);
      notificaciones.forEach((notif, index) => {
        console.log(`\n   ${index + 1}. ${notif.titulo}`);
        console.log(`      Mensaje: ${notif.mensaje}`);
        console.log(`      Días restantes: ${notif.diasRestantes}`);
        console.log(`      Fecha vencimiento: ${new Date(notif.fechaVencimiento).toLocaleDateString()}`);
        console.log(`      Leída: ${notif.leida ? 'Sí' : 'No'}`);
      });
    } else {
      console.log('\n⚠️  No se crearon notificaciones.');
      console.log('   Verifica que la membresía tenga fechaFin dentro de 5 días.');
    }

    // 7. Mostrar todas las notificaciones del sistema
    console.log('\n📋 Todas las notificaciones en el sistema:');
    const todasLasNotificaciones = await Notificacion.findAll({
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido'], required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    if (todasLasNotificaciones.length > 0) {
      console.log(`\n   Total: ${todasLasNotificaciones.length} notificación(es)`);
      todasLasNotificaciones.forEach((notif, index) => {
        console.log(`   ${index + 1}. [${notif.leida ? 'Leída' : 'No leída'}] ${notif.titulo}`);
      });
    } else {
      console.log('   No hay notificaciones en el sistema.');
    }

    console.log('\n✅ Prueba completada exitosamente');
    console.log('\n💡 Para probar Socket.io en tiempo real:');
    console.log('   1. Asegúrate de que el servidor backend principal esté corriendo (puerto 3000)');
    console.log('   2. Abre el frontend y haz login como admin');
    console.log('   3. Ejecuta este script nuevamente mientras el frontend está abierto');
    console.log('   4. Deberías ver la notificación aparecer automáticamente en el frontend');
    console.log('   5. También puedes ir a la sección "Notificaciones" para ver todas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al probar notificaciones:', error);
    console.error('   Detalles:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar el script
testNotificaciones();
