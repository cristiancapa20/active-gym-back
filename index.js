require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/config/syncDatabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Configurar CORS para permitir acceso desde cualquier origen (útil para ngrok y desarrollo)
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir cualquier origen (útil para ngrok y desarrollo)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Manejar preflight requests explícitamente
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear URL encoded

// Ruta de prueba/health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Gym está funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin',
      cliente: '/api/cliente',
      membresia: '/api/membresia',
      qr: '/api/qr',
      asistencia: '/api/asistencia'
    }
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api', routes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos con la base de datos (crear tablas si no existen)
    await syncDatabase(false); // false = no forzar recreación de tablas
    
    // Obtener IP local para acceso desde red local
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
      if (localIP !== 'localhost') break;
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en:`);
      console.log(`   - Local: http://localhost:${PORT}`);
      console.log(`   - Red local: http://${localIP}:${PORT}`);
      console.log(`📋 Health check: http://${localIP}:${PORT}/health`);
      console.log(`🔗 API disponible en: http://${localIP}:${PORT}/api`);
      console.log(`\n📱 Para acceder desde tu celular:`);
      console.log(`   - Asegúrate de estar en la misma red WiFi`);
      console.log(`   - Abre: http://${localIP}:${PORT}`);
      console.log(`\n📚 Endpoints disponibles:`);
      console.log(`   - Admin: http://${localIP}:${PORT}/api/admin`);
      console.log(`   - Cliente: http://${localIP}:${PORT}/api/cliente`);
      console.log(`   - Membresía: http://${localIP}:${PORT}/api/membresia`);
      console.log(`   - QR: http://${localIP}:${PORT}/api/qr`);
      console.log(`   - Asistencia: http://${localIP}:${PORT}/api/asistencia`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
