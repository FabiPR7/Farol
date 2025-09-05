const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
//app.use(cors({ origin: ['http://localhost:3000', 'https://tuapp.vercel.app'] }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 1407;
app.listen(PORT, () => console.log(`API on :${PORT}`));
