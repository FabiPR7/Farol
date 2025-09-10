const express = require('express');
const router = express.Router();
const pool = require('../../bd/BdConnection');
const Profile = require('../Class/Profile');

router.post('/ipbd', async (req, res) => {
    try {
      const { name, lastname, iduser } = req.body; 
  
      if (!name || !lastname || !iduser) {
        return res.status(400).json({ error: "Faltan datos: name, lastname y iduser son obligatorios" });
      }
      const dateCreated = new Date();
      const profile = new Profile(null, name, lastname, iduser, dateCreated);
      const result = await pool.query(
        "INSERT INTO profiles (name, lastname, iduser, age) VALUES ($1, $2, $3, $4) RETURNING *",
        [profile.name, profile.lastname, profile.iduser, profile.age]
      );
  
      res.status(201).json({idprofile: result.rows[0].idprofile}); 
    } catch (err) {

      console.error(err.message);

      if (err.code === '23505') { 
        return res.status(400).json({ error: "El iduser ya está registrado" });
      }
      res.status(500).json({ error: "Error al insertar el usuario" });
    }
  });

  router.put('/uppcvsbd', async (req, res) => {
    try {
      const { iduser, presentation, cv, studies } = req.body;
  
      if (!iduser) {
        return res.status(400).json({ error: "El iduser es obligatorio para actualizar el perfil" });
      }
        
      const result = await pool.query(
        `UPDATE profiles 
         SET presentation = $1, 
             cv = $2, 
             studies = $3
         WHERE iduser = $4
         RETURNING iduser, presentation, cv, studies`,
        [presentation || null , cv || null, studies || null, iduser]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Perfil no encontrado para este iduser" });
      }
  
      res.status(200).json(result.rows[0]);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  });  

module.exports = router;
