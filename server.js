const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();

// 1. CONFIGURACIÓN DE CORS
app.use(cors({
  origin: 'https://sweet-khapse-14dc31.netlify.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. MIDDLEWARES
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 3. RUTAS

// Salud del servidor
app.get('/health', (req, res) => {
  res.send('Servidor vivo y funcionando');
});

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

// CREAR una nueva tarea
app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  try {
    await db.query(
      "INSERT INTO tasks (title, priority, isCompleted) VALUES (?, ?, 0)", 
      [title, priority]
    );
    res.status(201).json({ success: true, message: "Tarea creada" });
  } catch (e) {
    console.error("ERROR EN POST /api/tasks:", e.message);
    res.status(500).json({ error: "Error al crear la tarea." });
  }
});

// ACTUALIZAR una tarea
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority, completed } = req.body;
  try {
    await db.query(
      "UPDATE tasks SET title = ?, priority = ?, isCompleted = ? WHERE id = ?", 
      [title, priority, completed ? 1 : 0, id]
    );
    res.json({ success: true, message: "Tarea actualizada" });
  } catch (e) {
    console.error("ERROR EN PUT /api/tasks:", e.message);
    res.status(500).json({ error: "Error al actualizar la tarea." });
  }
});

// ELIMINAR una tarea
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ success: true, message: "Tarea eliminada" });
  } catch (e) {
    console.error("ERROR EN DELETE /api/tasks:", e.message);
    res.status(500).json({ error: "Error al eliminar la tarea." });
  }
});

// Servir el Index.html para cualquier otra ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// 4. PUERTO
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`>>> Servidor iniciado en puerto ${port}`);
});