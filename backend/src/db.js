const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const dbType = (process.env.DB_TYPE || 'local').toLowerCase();
let mysqlPool;
let localDbFile;
let localDb = { inquiries: [] };

function buildMysqlPool() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'siri_vruddhi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
  };

  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: true };
  }

  return mysql.createPool(config);
}

if (dbType === 'mysql') {
  mysqlPool = buildMysqlPool();
} else {
  localDbFile = path.join(__dirname, '..', 'data', 'local-db.json');
  const localDbDir = path.dirname(localDbFile);

  if (!fs.existsSync(localDbDir)) {
    fs.mkdirSync(localDbDir, { recursive: true });
  }

  if (!fs.existsSync(localDbFile)) {
    fs.writeFileSync(localDbFile, JSON.stringify(localDb, null, 2));
  }

  try {
    localDb = JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
  } catch (error) {
    localDb = { inquiries: [] };
  }
}

function saveLocalDb() {
  if (localDbFile) {
    fs.writeFileSync(localDbFile, JSON.stringify(localDb, null, 2));
  }
}

async function execute(query, params) {
  if (dbType === 'mysql') {
    return mysqlPool.execute(query, params);
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.startsWith('insert into inquiries')) {
    const [name, email, phone, eventType, message] = params;
    const id = localDb.inquiries.length > 0 ? localDb.inquiries[localDb.inquiries.length - 1].id + 1 : 1;
    const inquiry = {
      id,
      name,
      email,
      phone,
      event_type: eventType,
      message,
      status: 'new',
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    localDb.inquiries.push(inquiry);
    saveLocalDb();

    return [{ insertId: id }, undefined];
  }

  if (normalizedQuery.startsWith('select 1')) {
    return [[{ ok: 1 }], undefined];
  }

  throw new Error('Local database only supports inquiry insert operations.');
}

async function ping() {
  if (dbType === 'mysql') {
    await mysqlPool.execute('SELECT 1');
    return 'mysql';
  }
  return 'local';
}

module.exports = {
  execute,
  ping,
  dbType,
  mysqlPool,
};
