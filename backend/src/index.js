const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');
const { ping, dbType } = require('./db');

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:4200'];

app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', contactRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const db = await ping();
    res.json({
      status: 'ok',
      service: 'Siri Vruddhi Backend',
      db,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      service: 'Siri Vruddhi Backend',
      db: dbType,
      message: 'Database connection failed',
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Siri Vruddhi backend listening on port ${port} (${dbType})`);
});
