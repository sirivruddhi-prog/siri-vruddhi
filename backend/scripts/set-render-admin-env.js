/**
 * Set admin env vars on the live Render service via API.
 * Usage:
 *   set RENDER_API_KEY=rnd_...
 *   node scripts/set-render-admin-env.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'siri-vruddhi-api';
const API_KEY = process.env.RENDER_API_KEY;

async function main() {
  if (!API_KEY) {
    console.error('Set RENDER_API_KEY (from Render Dashboard → Account Settings → API Keys).');
    process.exit(1);
  }

  const vars = {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'sirivruddhi@gmail.com',
  };

  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      console.error(`Missing ${key} in backend/.env`);
      process.exit(1);
    }
  }

  const listRes = await fetch('https://api.render.com/v1/services?limit=50', {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!listRes.ok) {
    throw new Error(`List services failed: ${listRes.status} ${await listRes.text()}`);
  }

  const services = await listRes.json();
  const service = services.find((item) => item.service?.name === SERVICE_ID)?.service
    || services.find((item) => item.service?.slug === SERVICE_ID)?.service;

  if (!service) {
    throw new Error(`Service "${SERVICE_ID}" not found. Set RENDER_SERVICE_ID to your web service name.`);
  }

  for (const [key, value] of Object.entries(vars)) {
    const res = await fetch(`https://api.render.com/v1/services/${service.id}/env-vars`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ envVar: { key, value } }),
    });

    if (!res.ok) {
      throw new Error(`Set ${key} failed: ${res.status} ${await res.text()}`);
    }
    console.log(`Set ${key}`);
  }

  console.log('Done. Trigger Manual Deploy on Render if the service does not auto-restart.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
