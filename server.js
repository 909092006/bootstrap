const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();

// 1. CONFIGURACIÓN DE CORS (Solo una vez y con la URL correcta)
app.use(cors({
  origin: 'https://sweet-khapse-14dc31.netlify.app', // Nota: Sin la barra '/' al final
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. MIDDLEWARES
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 3. RUTAS
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

app.get('/health', (req, res) => {
  res.send('Servidor vivo y funcionando');
});

app.get('/api/tasks', async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: Boolean(t.isCompleted)
    })));
  } catch (e) {
    console.error("ERROR EN DB:", e.message);
    res.status(500).json({ error: "Error de conexión. Revisa Railway." });
  }
});

// 4. PUERTO (Render usa process.env.PORT)
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`>>> Servidor iniciado en puerto ${port}`);
});
