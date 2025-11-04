const express = require('express');
const router = express.Router();
const pool = require('../../bd/BdConnection');
const Profile = require('../Class/Profile');

async function wakeDB() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos despierta');
  } catch (err) {
    console.error('❌ Error despertando la BD:', err);
  }
}

router.post("/ipbd", async (req, res) => {
  try {
    await wakeDB();
    const { name, lastname, country, date, iduser } = req.body;
    if (!name || !iduser) {
      return res.status(400).json({ error: "Faltan datos obligatorios: name o iduser" });
    }
    const insertResult = await pool.query(
      "INSERT INTO profiles (name, iduser) VALUES ($1, $2) RETURNING *",
      [name, iduser]
    );
    const idprofile = insertResult.rows[0].idprofile;
    const updateFields = {};
    if (lastname) updateFields.lastname = lastname;
    if (country) updateFields.country = country;
    if (date) updateFields.date = new Date(date);

    if (Object.keys(updateFields).length > 0) {
      const allowedColumns = ["lastname", "country", "date"];
      for (let col of Object.keys(updateFields)) {
        if (!allowedColumns.includes(col)) {
          throw new Error(`Columna no permitida: ${col}`);
        }
      }
      const setClause = Object.keys(updateFields)
        .map((col, i) => `${col} = $${i + 1}`)
        .join(", ");
      const values = Object.values(updateFields);
      values.push(iduser);

      await pool.query(
        `UPDATE profiles SET ${setClause} WHERE iduser = $${values.length}`,
        values
      );
    }
    res.status(201).json({ idprofile });
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "El iduser ya está registrado" });
    }

    //
    res.status(500).json({ error: "Error al insertar o actualizar el usuario" } + err + " CCC");
  }
});
router.put('/uppcvsbd', async (req, res) => {
  try {
    await wakeDB();
    const { iduser, presentation, cv, skills: skill } = req.body;

    if (!iduser) {
      return res.status(400).json({ error: "El iduser es obligatorio para actualizar el perfil" });
    }

    const updateFields = {};
    if (presentation !== undefined) updateFields.presentation = presentation;
    if (cv !== undefined) updateFields.cv = cv;
    if (skill !== undefined) updateFields.skill = skill;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No se enviaron campos para actualizar" });
    }

    const allowedColumns = ["presentation", "cv", "skills"];
    for (let col of Object.keys(updateFields)) {
      if (!allowedColumns.includes(col)) {
        throw new Error(`Columna no permitida: ${col}`);
      }
    }

    const setClause = Object.keys(updateFields)
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");

    const values = Object.values(updateFields);
    values.push(iduser);

    const result = await pool.query(
      `UPDATE profiles SET ${setClause} WHERE iduser = $${values.length} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Perfil no encontrado para este iduser" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error en /uppcvsbd:", err);
    res.status(500).json({ error: "Error al actualizar el perfil", details: err.message });
  }
});

module.exports = router;
