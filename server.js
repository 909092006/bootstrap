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

// --- RUTAS API ---
app.get('/api/tasks', async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: Boolean(t.isCompleted)
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority, completed } = req.body;
    const [result] = await db.query(
      "INSERT INTO tasks(title, priority, isCompleted) VALUES(?,?,?)",
      [title, priority, completed ? 1 : 0]
    );
    res.json({ id: result.insertId, title, priority, completed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM tasks WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CONFIGURACIÓN PARA RAILWAY (Basado en la documentación que pasaste) ---
const port = process.env.PORT || 3000;

// Escuchamos en port y en el host 0.0.0.0 como pide la guía oficial
app.listen(port, "0.0.0.0", () => {
  console.log(`Aplicación escuchando en el puerto ${port} con host 0.0.0.0`);
});