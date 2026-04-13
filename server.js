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

app.get('/api/tasks', async (req, res) => {
  const [tasks] = await db.query("SELECT * FROM tasks ORDER BY id ASC");
  res.json(tasks.map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      completed: Boolean(t.isCompleted)
  })));
});

app.get('/api/tasks/:id', async (req, res) => {
  const [task] = await db.query("SELECT * FROM tasks WHERE id=?", [req.params.id]);
  res.json({
    id: task[0].id,
    title: task[0].title,
    priority: task[0].priority,
    completed: Boolean(task[0].isCompleted)
  });
});

app.post('/api/tasks', async (req, res) => {
  const { title, priority, completed } = req.body;

  const [result] = await db.query(
    "INSERT INTO tasks(title, priority, isCompleted) VALUES(?,?,?)",
    [title, priority, completed ? 1 : 0]
  );

  res.json({ id: result.insertId, title, priority, completed });
});

app.put('/api/tasks/:id', async (req, res) => {
  const { title, priority, completed } = req.body;

  await db.query(
    "UPDATE tasks SET title=?, priority=?, isCompleted=? WHERE id=?",
    [title, priority, completed ? 1 : 0, req.params.id]
  );

  res.json({ message: "Updated" });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await db.query("DELETE FROM tasks WHERE id=?", [req.params.id]);
  res.json({ message: "Deleted" });
});

// Use `PORT` provided in environment or default to 3000
const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
async function bootstrap() {
  // ...
  await app.listen(port, "0.0.0.0");
}