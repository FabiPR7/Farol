const { Pool } = require('pg');

// Datos de conexión: puedes ponerlos en variables de entorno
const pool = new Pool({
  user: process.env.PG_USER || 'tu_usuario',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'mi_base',
  password: process.env.PG_PASSWORD || 'mi_contraseña',
  port: process.env.PG_PORT || 5432,
});

module.exports = pool;
