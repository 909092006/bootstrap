const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();

// 1. CONFIGURACIÓN DE CORS
// 1. CONFIGURACIÓN DE CORS (Relajada para evitar bloqueos)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. MIDDLEWARES
app.use(express.json());

// 3. RUTAS DE LA API (Deben ir antes de express.static)

// OBTENER todas las tareas
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
    console.error("ERROR EN GET /api/tasks:", e.message);
    res.status(500).json({ error: "Error al obtener tareas." });
  }
});

// CREAR tarea
app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  try {
    await db.query(
      "INSERT INTO tasks (title, priority, isCompleted) VALUES (?, ?, 0)", 
      [title, priority]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    console.error("ERROR EN POST:", e.message);
    res.status(500).json({ error: "Error al crear" });
  }
});

// ACTUALIZAR tarea
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority, completed } = req.body;
  try {
    await db.query(
      "UPDATE tasks SET title = ?, priority = ?, isCompleted = ? WHERE id = ?", 
      [title, priority, completed ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error("ERROR EN PUT:", e.message);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// ELIMINAR tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error("ERROR EN DELETE:", e.message);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// 4. ARCHIVOS ESTÁTICOS (Al final para no interferir con la API)
app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// 5. PUERTO
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`>>> Servidor iniciado en puerto ${port}`);
});