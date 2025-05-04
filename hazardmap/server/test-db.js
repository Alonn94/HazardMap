// test-db.js
require('dotenv').config();
const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

knex.raw('SELECT 1')
  .then(() => {
    console.log('✅ Connected to Neon successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });