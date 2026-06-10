/**
 * Test MySQL connection using backend/.env
 * Run: node scripts/test-db.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { ping } = require('../src/db');

ping()
  .then((mode) => {
    console.log('Database OK:', mode);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database FAILED:', err.message);
    process.exit(1);
  });
