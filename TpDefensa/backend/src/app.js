const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const turnosRoutes = require('./routes/turnos.routes');
const chequeosRoutes = require('./routes/chequeos.routes');
const vehiculosRoutes = require('./routes/vehiculos.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API (deben estar ANTES del static y del wildcard)
app.use('/auth', authRoutes);
app.use('/turnos', turnosRoutes);
app.use('/chequeos', chequeosRoutes);
app.use('/vehiculos', vehiculosRoutes);

// Servir archivos estáticos del frontend (si existe en el contenedor)
const frontendPath = '/app/frontend';
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Servir index.html para todas las rutas no-API (debe estar DESPUÉS de las rutas de API)
app.get('*', (req, res) => {
  // Solo servir el frontend si NO es una ruta de API
  if (!req.path.startsWith('/api') && 
      !req.path.startsWith('/auth') && 
      !req.path.startsWith('/turnos') && 
      !req.path.startsWith('/chequeos') && 
      !req.path.startsWith('/vehiculos') && 
      req.path !== '/health' && 
      !req.path.startsWith('/styles.css') && 
      !req.path.startsWith('/app.js')) {
    const indexPath = path.join(frontendPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend no encontrado. Ruta buscada: ' + indexPath });
    }
  }
});

app.use(errorHandler);

module.exports = app;

