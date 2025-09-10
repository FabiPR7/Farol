const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./User/DB/userDb'); 
const profileRoutes = require('./Profile/DB/profileBD');

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'https://tuapp.vercel.app'] }));

app.get('/health', (_req, res) => res.json({ ok: "Hola fabi"}));

app.use(usersRoutes);
app.use(profileRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API on :${PORT}`));
