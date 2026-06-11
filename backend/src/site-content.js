const fs = require('fs');
const path = require('path');
const { dbType, mysqlPool } = require('./db');
const {
  SECTION_KEYS,
  getDefaultSection,
  getAllDefaults,
  buildPublicPayload,
} = require('./site-content-defaults');

let localDbFile;
let localSections = null;

if (dbType !== 'mysql') {
  localDbFile = path.join(__dirname, '..', 'data', 'local-db.json');
}

function readLocalDb() {
  if (!localDbFile || !fs.existsSync(localDbFile)) {
    return { inquiries: [], site_content: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
  } catch {
    return { inquiries: [], site_content: {} };
  }
}

function writeLocalDb(data) {
  if (localDbFile) {
    fs.writeFileSync(localDbFile, JSON.stringify(data, null, 2));
  }
}

function parseRow(row) {
  if (!row) {
    return null;
  }
  if (typeof row.content_json === 'string') {
    return JSON.parse(row.content_json);
  }
  return row.content_json;
}

async function getSection(key) {
  if (!SECTION_KEYS.includes(key)) {
    return null;
  }

  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.execute(
      'SELECT content_json, updated_at FROM site_content WHERE section_key = ?',
      [key]
    );
    if (rows.length) {
      return { content: parseRow(rows[0]), updatedAt: rows[0].updated_at };
    }
    const content = getDefaultSection(key);
    await mysqlPool.execute(
      'INSERT INTO site_content (section_key, content_json) VALUES (?, ?)',
      [key, JSON.stringify(content)]
    );
    return { content, updatedAt: new Date().toISOString() };
  }

  const db = readLocalDb();
  if (!db.site_content) {
    db.site_content = {};
  }
  if (!db.site_content[key]) {
    db.site_content[key] = {
      content: getDefaultSection(key),
      updatedAt: new Date().toISOString(),
    };
    writeLocalDb(db);
  }
  return db.site_content[key];
}

async function getAllSections() {
  const sections = {};
  const meta = { updatedAt: null, sections: {} };

  for (const key of SECTION_KEYS) {
    const row = await getSection(key);
    sections[key] = row.content;
    meta.sections[key] = row.updatedAt;
    if (!meta.updatedAt || new Date(row.updatedAt) > new Date(meta.updatedAt)) {
      meta.updatedAt = row.updatedAt;
    }
  }

  sections._meta = meta;
  return sections;
}

async function updateSection(key, content) {
  if (!SECTION_KEYS.includes(key)) {
    throw new Error('Invalid section key.');
  }

  const now = new Date().toISOString();

  if (dbType === 'mysql') {
    await mysqlPool.execute(
      `INSERT INTO site_content (section_key, content_json, updated_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), updated_at = VALUES(updated_at)`,
      [key, JSON.stringify(content), now]
    );
    return { content, updatedAt: now };
  }

  const db = readLocalDb();
  if (!db.site_content) {
    db.site_content = {};
  }
  db.site_content[key] = { content, updatedAt: now };
  writeLocalDb(db);
  return { content, updatedAt: now };
}

async function getPublicSiteContent(req) {
  const sections = await getAllSections();
  return buildPublicPayload(sections, req);
}

async function getContentMeta() {
  const sections = await getAllSections();
  return {
    updatedAt: sections._meta?.updatedAt || null,
    sections: sections._meta?.sections || {},
  };
}

function resetLocalCache() {
  localSections = null;
}

module.exports = {
  SECTION_KEYS,
  getSection,
  getAllSections,
  updateSection,
  getPublicSiteContent,
  getContentMeta,
  getAllDefaults,
  resetLocalCache,
};
