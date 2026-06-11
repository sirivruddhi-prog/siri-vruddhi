const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { dbType, mysqlPool } = require('./db');

const LOCAL_MEDIA_DIR = path.join(__dirname, '..', 'data', 'media');
let localDbFile;
let localMediaMeta = [];

if (dbType !== 'mysql') {
  localDbFile = path.join(__dirname, '..', 'data', 'local-db.json');
  if (!fs.existsSync(LOCAL_MEDIA_DIR)) {
    fs.mkdirSync(LOCAL_MEDIA_DIR, { recursive: true });
  }
  if (fs.existsSync(localDbFile)) {
    try {
      const db = JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
      localMediaMeta = db.media_assets || [];
    } catch {
      localMediaMeta = [];
    }
  }
}

function getPublicApiBase(req) {
  if (process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (req) {
    return `${req.protocol}://${req.get('host')}`;
  }
  return 'http://localhost:3000';
}

function buildMediaUrl(req, id, filename) {
  return `${getPublicApiBase(req)}/api/media/${id}/${encodeURIComponent(filename)}`;
}

async function optimizeImage(buffer, mimeType) {
  try {
    const image = sharp(buffer, { failOn: 'none' });
    const metadata = await image.metadata();
    if (!metadata.width) {
      return { buffer, mimeType };
    }

    const optimized = await image
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return {
      buffer: optimized,
      mimeType: 'image/jpeg',
    };
  } catch {
    return { buffer, mimeType };
  }
}

function saveLocalMediaMeta() {
  if (!localDbFile) return;
  let db = { inquiries: [], site_content: {}, media_assets: [] };
  if (fs.existsSync(localDbFile)) {
    try {
      db = JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
    } catch {
      db = { inquiries: [], site_content: {}, media_assets: [] };
    }
  }
  db.media_assets = localMediaMeta;
  fs.writeFileSync(localDbFile, JSON.stringify(db, null, 2));
}

async function saveMedia(file, req) {
  const { buffer: optimizedBuffer, mimeType } = await optimizeImage(file.buffer, file.mimetype);
  const safeName = (file.originalname || 'upload.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180) || 'upload.jpg';
  const filename = safeName.toLowerCase().endsWith('.jpg') ? safeName : `${safeName.replace(/\.[^.]+$/, '')}.jpg`;

  if (dbType === 'mysql') {
    const [result] = await mysqlPool.execute(
      'INSERT INTO media_assets (filename, mime_type, file_size, data) VALUES (?, ?, ?, ?)',
      [filename, mimeType, optimizedBuffer.length, optimizedBuffer]
    );
    const id = result.insertId;
    return {
      id,
      filename,
      mimeType,
      size: optimizedBuffer.length,
      url: buildMediaUrl(req, id, filename),
    };
  }

  const id = localMediaMeta.length > 0 ? localMediaMeta[localMediaMeta.length - 1].id + 1 : 1;
  const diskName = `${id}-${filename}`;
  fs.writeFileSync(path.join(LOCAL_MEDIA_DIR, diskName), optimizedBuffer);
  const record = {
    id,
    filename,
    mime_type: mimeType,
    file_size: optimizedBuffer.length,
    diskName,
    created_at: new Date().toISOString(),
  };
  localMediaMeta.push(record);
  saveLocalMediaMeta();

  return {
    id,
    filename,
    mimeType,
    size: optimizedBuffer.length,
    url: buildMediaUrl(req, id, filename),
  };
}

async function getMedia(id) {
  const mediaId = parseInt(id, 10);
  if (!mediaId) return null;

  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.execute(
      'SELECT id, filename, mime_type, file_size, data FROM media_assets WHERE id = ?',
      [mediaId]
    );
    if (!rows.length) return null;
    return {
      id: rows[0].id,
      filename: rows[0].filename,
      mimeType: rows[0].mime_type,
      size: rows[0].file_size,
      data: rows[0].data,
    };
  }

  const row = localMediaMeta.find((item) => item.id === mediaId);
  if (!row) return null;
  const filePath = path.join(LOCAL_MEDIA_DIR, row.diskName);
  if (!fs.existsSync(filePath)) return null;
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.file_size,
    data: fs.readFileSync(filePath),
  };
}

function legacyAssetUrl(file) {
  if (!file) return '';
  const encoded = encodeURIComponent(file).replace(/%2F/g, '/');
  const siteBase = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const assetPath = `assets/images/${encoded}`;
  return siteBase ? `${siteBase}/${assetPath}` : `/${assetPath}`;
}

function resolveImageRef(ref, req) {
  if (!ref) return '';
  if (typeof ref === 'string') {
    if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
    if (ref.startsWith('/api/media/') && req) {
      return `${getPublicApiBase(req)}${ref}`;
    }
    return legacyAssetUrl(ref);
  }

  if (ref.url || ref.imageUrl) return ref.url || ref.imageUrl;
  if (ref.mediaId && req) {
    return buildMediaUrl(req, ref.mediaId, ref.filename || 'image.jpg');
  }
  if (ref.file) return legacyAssetUrl(ref.file);
  if (ref.imageFile) return legacyAssetUrl(ref.imageFile);
  return '';
}

module.exports = {
  saveMedia,
  getMedia,
  resolveImageRef,
  buildMediaUrl,
  getPublicApiBase,
};
