const cron = require('node-cron');
const { Sequelize } = require('sequelize');
const { QR, Membresia, Notificacion, Cliente } = require('../models');

/**
 * Función para desactivar membresías y QR vencidos
 * Se ejecuta diariamente a las 00:00 (medianoche)
 */
async function desactivarVencidos(io = null) {
  try {
    const ahora = new Date();
    console.log(`[${ahora.toISOString()}] Iniciando verificación de membresías y QR vencidos...`);

    // 1. Marcar membresías vencidas como 'vencida'
    const membresiasVencidas = await Membresia.update(
      { estado: 'vencida' },
      {
        where: {
          estado: 'activa',
          fechaFin: {
            [Sequelize.Op.lt]: ahora // fechaFin < ahora
          }
        }
      }
    );

    console.log(`Membresías vencidas: ${membresiasVencidas[0]}`);

    // 2. Desactivar QR vencidos (por fecha de expiración)
    const qrsVencidosPorFecha = await QR.update(
      { activo: false },
      {
        where: {
          activo: true,
          fechaExpiracion: {
            [Sequelize.Op.lt]: ahora // fechaExpiracion < ahora
          }
        }
      }
    );

    console.log(`QR desactivados por fecha de expiración: ${qrsVencidosPorFecha[0]}`);

    // 3. Desactivar QR cuyas membresías están vencidas o canceladas
    // Primero obtener todas las membresías vencidas o canceladas
    const membresiasInactivas = await Membresia.findAll({
      where: { 
        estado: {
          [Sequelize.Op.in]: ['vencida', 'cancelada']
        }
      },
      attributes: ['id']
    });

    const membresiasInactivasIds = membresiasInactivas.map(m => m.id);

    if (membresiasInactivasIds.length > 0) {
      const qrsConMembresiaInactiva = await QR.update(
        { activo: false },
        {
          where: {
            activo: true,
            membresiaId: {
              [Sequelize.Op.in]: membresiasInactivasIds
            }
          }
        }
      );

      console.log(`QR desactivados por membresía inactiva: ${qrsConMembresiaInactiva[0]}`);
    }

    // 4. Crear notificaciones para membresías que vencen en 5 días
    const cincoDiasDespues = new Date();
    cincoDiasDespues.setDate(cincoDiasDespues.getDate() + 5);
    
    // Obtener membresías que vencen en 5 días
    const membresiasPorVencer = await Membresia.findAll({
      where: {
        estado: 'activa',
        fechaFin: {
          [Sequelize.Op.between]: [ahora, cincoDiasDespues]
        }
      },
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    let notificacionesCreadas = 0;
    for (const membresia of membresiasPorVencer) {
      // Calcular días restantes
      const diasRestantes = Math.ceil((new Date(membresia.fechaFin) - ahora) / (1000 * 60 * 60 * 24));
      
      // Verificar si ya existe una notificación para esta membresía
      const notificacionExistente = await Notificacion.findOne({
        where: {
          membresiaId: membresia.id,
          tipo: 'membresia_por_vencer',
          leida: false
        }
      });

      // Solo crear notificación si no existe una no leída
      if (!notificacionExistente && diasRestantes <= 5) {
        const nuevaNotificacion = await Notificacion.create({
          clienteId: membresia.clienteId,
          membresiaId: membresia.id,
          tipo: 'membresia_por_vencer',
          titulo: `Membresía por vencer - ${membresia.cliente.nombre} ${membresia.cliente.apellido}`,
          mensaje: `La membresía ${membresia.tipo} del cliente:`,
          fechaVencimiento: membresia.fechaFin,
          diasRestantes: diasRestantes,
          leida: false
        });
        
        // Cargar la notificación completa con relaciones para emitir
        const notificacionCompleta = await Notificacion.findByPk(nuevaNotificacion.id, {
          include: [
            { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido'] },
            { model: Membresia, as: 'membresia', attributes: ['id', 'tipo'] }
          ]
        });
        
        // Emitir evento de nueva notificación a través de Socket.io
        if (io) {
          io.emit('nueva_notificacion', {
            success: true,
            data: notificacionCompleta
          });
          console.log(`📢 Notificación emitida vía Socket.io: ${notificacionCompleta.id}`);
        }
        
        notificacionesCreadas++;
      }
    }

    console.log(`Notificaciones creadas: ${notificacionesCreadas}`);

    console.log(`[${new Date().toISOString()}] Verificación completada exitosamente.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error al ejecutar cron job:`, error);
  }
}

/**
 * Inicializar los cron jobs
 */
function iniciarCronJobs(io = null) {
  // Ejecutar diariamente a las 00:00 (medianoche)
  // Formato: segundo minuto hora día mes día-semana
  cron.schedule('0 0 * * *', async () => {
    await desactivarVencidos(io);
  }, {
    scheduled: true,
    timezone: "America/Bogota" // Ajusta según tu zona horaria
  });

  // También ejecutar inmediatamente al iniciar el servidor (opcional, para testing)
  // Comentar esta línea en producción si no se desea
  desactivarVencidos(io);

  console.log('✅ Cron jobs iniciados. Verificación diaria a las 00:00');
}

module.exports = {
  iniciarCronJobs,
  desactivarVencidos
};
