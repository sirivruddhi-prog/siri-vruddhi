const fs = require('fs');
const path = require('path');
const { dbType, mysqlPool } = require('./db');

const STATUSES = ['new', 'contacted', 'visit_scheduled', 'booked', 'closed'];
let localDbFile;
let localDb = { inquiries: [] };

if (dbType !== 'mysql') {
  localDbFile = path.join(__dirname, '..', 'data', 'local-db.json');
  if (fs.existsSync(localDbFile)) {
    try {
      localDb = JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
    } catch {
      localDb = { inquiries: [] };
    }
  }
}

function saveLocalDb() {
  if (localDbFile) {
    fs.writeFileSync(localDbFile, JSON.stringify(localDb, null, 2));
  }
}

function normalizeRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    eventType: row.event_type || row.eventType,
    message: row.message || '',
    status: row.status || 'new',
    adminNotes: row.admin_notes ?? row.adminNotes ?? null,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt || null,
  };
}

function matchesSearch(row, search) {
  if (!search) {
    return true;
  }
  const term = search.toLowerCase();
  const fields = [row.name, row.email, row.phone, row.event_type, row.message, row.admin_notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return fields.includes(term);
}

function isThisWeek(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return date >= start;
}

function buildCounts(rows) {
  return {
    new: rows.filter((row) => (row.status || 'new') === 'new').length,
    thisWeek: rows.filter((row) => isThisWeek(row.created_at || row.createdAt)).length,
  };
}

async function listInquiries(filters = {}) {
  const {
    status,
    eventType,
    search,
    page = 1,
    limit = 50,
  } = filters;

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  if (dbType === 'mysql') {
    const conditions = [];
    const params = [];

    if (status && STATUSES.includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (eventType) {
      conditions.push('event_type = ?');
      params.push(eventType);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR event_type LIKE ? OR message LIKE ? OR admin_notes LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await mysqlPool.execute(
      `SELECT COUNT(*) AS total FROM inquiries ${where}`,
      params
    );
    const total = countRows[0].total;

    const [allRows] = await mysqlPool.execute('SELECT status, created_at FROM inquiries');
    const counts = buildCounts(allRows);

    const [rows] = await mysqlPool.execute(
      `SELECT id, name, email, phone, event_type, message, status, admin_notes, created_at, updated_at
       FROM inquiries ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return {
      inquiries: rows.map(normalizeRow),
      total,
      page: safePage,
      limit: safeLimit,
      counts,
    };
  }

  let rows = [...(localDb.inquiries || [])];

  if (status && STATUSES.includes(status)) {
    rows = rows.filter((row) => (row.status || 'new') === status);
  }

  if (eventType) {
    rows = rows.filter((row) => row.event_type === eventType);
  }

  if (search) {
    rows = rows.filter((row) => matchesSearch(row, search));
  }

  const counts = buildCounts(localDb.inquiries || []);
  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = rows.length;
  const paged = rows.slice(offset, offset + safeLimit);

  return {
    inquiries: paged.map(normalizeRow),
    total,
    page: safePage,
    limit: safeLimit,
    counts,
  };
}

async function getInquiry(id) {
  const inquiryId = parseInt(id, 10);
  if (!inquiryId) {
    return null;
  }

  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.execute(
      `SELECT id, name, email, phone, event_type, message, status, admin_notes, created_at, updated_at
       FROM inquiries WHERE id = ?`,
      [inquiryId]
    );
    return rows.length ? normalizeRow(rows[0]) : null;
  }

  const row = (localDb.inquiries || []).find((item) => item.id === inquiryId);
  return row ? normalizeRow(row) : null;
}

async function updateInquiry(id, updates) {
  const inquiryId = parseInt(id, 10);
  if (!inquiryId) {
    return null;
  }

  const nextStatus = updates.status;
  const nextNotes = updates.adminNotes;

  if (nextStatus && !STATUSES.includes(nextStatus)) {
    throw new Error('Invalid status value.');
  }

  if (dbType === 'mysql') {
    const fields = [];
    const params = [];

    if (nextStatus) {
      fields.push('status = ?');
      params.push(nextStatus);
    }

    if (nextNotes !== undefined) {
      fields.push('admin_notes = ?');
      params.push(nextNotes);
    }

    if (!fields.length) {
      return getInquiry(inquiryId);
    }

    params.push(inquiryId);
    await mysqlPool.execute(
      `UPDATE inquiries SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    return getInquiry(inquiryId);
  }

  const index = (localDb.inquiries || []).findIndex((item) => item.id === inquiryId);
  if (index === -1) {
    return null;
  }

  const row = localDb.inquiries[index];
  if (nextStatus) {
    row.status = nextStatus;
  }
  if (nextNotes !== undefined) {
    row.admin_notes = nextNotes;
  }
  row.updated_at = new Date().toISOString();
  localDb.inquiries[index] = row;
  saveLocalDb();

  return normalizeRow(row);
}

async function listInquiriesForExport(filters = {}) {
  const result = await listInquiries({ ...filters, page: 1, limit: 10000 });
  return result.inquiries;
}

function toCsv(rows) {
  const header = ['id', 'name', 'email', 'phone', 'event_type', 'message', 'status', 'admin_notes', 'created_at', 'updated_at'];
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    header.join(','),
    ...rows.map((row) => [
      row.id,
      row.name,
      row.email,
      row.phone,
      row.eventType,
      row.message,
      row.status,
      row.adminNotes,
      row.createdAt,
      row.updatedAt,
    ].map(escape).join(',')),
  ];

  return lines.join('\n');
}

module.exports = {
  STATUSES,
  listInquiries,
  getInquiry,
  updateInquiry,
  listInquiriesForExport,
  toCsv,
};
