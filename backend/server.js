const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./User/user'); 

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'https://tuapp.vercel.app'] }));

app.get('/health', (_req, res) => res.json({ ok: "Hola fabi"}));

// 👇 monta las rutas de users
app.use(usersRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API on :${PORT}`));
