const express = require('express');
const router = express.Router();
const pool = require('../../bd/BdConnection');
const Profile = require('../Class/Profile.cjs');
import FilenSDK from "filen";
import multer from "multer";


const upload = multer({ dest: "uploads/" });

const filen = new FilenSDK({
  email: "TU_EMAIL@ejemplo.com",
  password: "TU_CONTRASEÑA"
});


async function wakeDB() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos despierta');
  } catch (err) {
    console.error('❌ Error despertando la BD:', err);
  }
}

/*
  INSERTAR PERFIL
  name: string
  lastname: string
  country: string
  date: date
  iduser: number
  presentation: string
  cv: string
  skills: string
*/
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

async function uploadCV(filePath) {
  try {
      const result = await filen.uploadFile({
      path: filePath,
      parent: "root"
    });
    return result;
  } catch (err) {
    throw new Error("Error subiendo archivo:", err);
  }
}

/*
  ACTUALIZAR PERFIL

  presentation: string
  cv: string
  skills: string
*/
router.put("/uppcvsbd", upload.single("cv"), async (req, res) => {
  try {
    await wakeDB();

    const { iduser, presentation, skills } = req.body;
    if (!iduser) return res.status(400).json({ error: "iduser es obligatorio" });

    let cvUUID = null;
    if (req.file) {
        const result = await uploadCV(req.file.path);
        cvUUID = result.uuid;
    }

    const updateFields = {};
    if (presentation) updateFields.presentation = presentation;
    if (cvUUID) updateFields.cv = cvUUID;
    if (skills) updateFields.skills = skills;

    const setClause = Object.keys(updateFields)
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");
    const values = [...Object.values(updateFields), iduser];

    const query = `UPDATE profiles SET ${setClause} WHERE iduser = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el perfil", details: err.message });
  }
});
module.exports = router;
