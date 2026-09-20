const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),

    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
    } else {
        console.log('✅ Azure PostgreSQL connected successfully!');
        console.log('🕐 Database time:', result.rows[0].now);
    }
});

pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
`, (err, result) => {
    if (err) {
        console.error("❌ Failed to fetch tables:", err.message);
    } else {
        console.log("📋 Tables:", result.rows);
    }
});

pool.query(`
  SELECT
    current_database() AS database,
    current_user AS user,
    inet_server_addr() AS server_ip,
    version() AS version
`)
.then(result => {
  console.log('🔍 Database connection details:');
  console.log(result.rows[0]);
})
.catch(err => {
  console.error('❌ Database check failed:', err);
});

module.exports = pool;