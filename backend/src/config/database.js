const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reservasi_db',
  user: process.env.DB_USER || 'reservasi_user',
  password: process.env.DB_PASSWORD || 'reservasi_pass',
});

pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = pool;
