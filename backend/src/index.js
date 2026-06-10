const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');
const { ping, dbType } = require('./db');
const { getMailStatus, verifyMailConnection } = require('./mail');

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
    const mail = getMailStatus();
    res.json({
      status: 'ok',
      service: 'Siri Vruddhi Backend',
      db,
      email: mail,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      service: 'Siri Vruddhi Backend',
      db: dbType,
      message: 'Database connection failed',
      email: getMailStatus(),
    });
  }
});

app.get('/api/health/email', async (req, res) => {
  const mail = getMailStatus();
  const verify = await verifyMailConnection();
  res.status(verify.ok ? 200 : 503).json({
    ...mail,
    ...verify,
  });
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`Siri Vruddhi backend listening on port ${port} (${dbType})`);
  const mail = getMailStatus();
  if (!mail.configured) {
    console.warn('Email DISABLED: set RESEND_API_KEY on Render (or SMTP_* for local dev).');
  } else {
    const verify = await verifyMailConnection();
    if (verify.ok) {
      console.log(`Email enabled (${mail.provider}) → ${mail.notifyEmail}`);
    } else {
      console.error(`Email verify failed (${mail.provider}): ${verify.error}`);
    }
  }
});
