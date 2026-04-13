const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// Ruta de prueba para saber si el servidor está vivo
app.get('/health', (req, res) => {
  res.send('Servidor vivo y funcionando');
});

// API para obtener tareas con manejo de errores real
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
    res.status(500).json({ error: "No se pudo conectar a la base de datos. Revisa tus variables en Railway." });
  }
});

// ... (las demás rutas post, delete, etc., puedes dejarlas igual)

const port = process.env.PORT || 3000;

// Arrancamos el servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`>>> Servidor iniciado en puerto ${port}`);
});