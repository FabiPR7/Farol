const express = require('express');
const router = express.Router();
const pool = require('../bd/BdConnection');

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: `Error al consultar la base de datos ${err}` });
  }
});

module.exports = router;