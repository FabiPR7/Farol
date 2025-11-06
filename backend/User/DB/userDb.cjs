
const express = require('express');
const router = express.Router();
const pool = require('../../bd/BdConnection');
const bcrypt = require("bcrypt");
const User = require('../Class/User.cjs');



async function wakeDB() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos despierta');
  } catch (err) {
    console.error('❌ Error despertando la BD:', err);
  }
}


router.get('/gaubd', async (req, res) => {
  try {
    await wakeDB();
    const result = await pool.query('SELECT * FROM users');
    const usuarios = result.rows.map(row => 
      new User(row.iduser, row.email, null, row.datecreated)
    );
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: `Error al consultar la base de datos ${err}` });
  }
});


router.post('/iubd', async (req, res) => {
    try {
      await wakeDB();
      const { email, pwd } = req.body; 
      if (!pwd || !email) {
        return res.status(400).json({ error: "Faltan datos: email y pwd son obligatorios" });
      }
      const dateCreated = new Date();
      const hashedPWd = await bcrypt.hash(pwd,10)
      const user = new User(null, email, hashedPWd, dateCreated);
      const result = await pool.query(
        "INSERT INTO users (email, password, creationdate) VALUES ($1, $2, $3) RETURNING *",
        [user.email, user.pwd, user.dateCreated]
      );
  
      res.status(201).json({iduser: result.rows[0].iduser}); 
    } catch (err) {

      console.error(err.message);

      if (err.code === '23505') { 
        return res.status(400).json({ error: "El email ya está registrado" });
      }
      res.status(500).json({ error: "Error al insertar el usuario" });
    }
  });

  router.post('/lgubd', async (req, res) => {
    try {
      await wakeDB();
      const { email, pwd } = req.body;
  
      if (!email || !pwd) {
        return res.status(400).json({ error: "Faltan datos: email y pwd son obligatorios" });
      }
  
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      if (result.rowCount === 0) {
        return res.status(400).json({ error: "El email no está registrado" });
      }
  
      const user = result.rows[0];
  
      const isMatch = await bcrypt.compare(pwd, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
  
      res.status(200).json({
        message: true
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

module.exports = router;