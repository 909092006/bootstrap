const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors'); // CORS = Cross-Origin Resource Sharing

const app = express();

// Middlewares
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
}));

app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// ------- Example Route -------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// ------- Routes -------

// GET all tasks
app.get('/api/tasks/', async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET an specific task
app.get('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  try {
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
    
    if (!task || task.length === 0) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    res.json(task[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new task
app.post('/api/tasks/', async (req, res) => {
  const { title, priority } = req.body;

  // Validate required fields
  if (!title || !priority) {
    return res.status(400).json({ error: 'Title and priority are required' });
  }

  // Validate priority enum values
  const validPriorities = ['Low', 'Medium', 'High', 'low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
  }

  try {
    const query = "INSERT INTO tasks(title, priority, isCompleted) VALUES(?, ?, ?)";
    const [result] = await db.query(query, [title, priority, false]);
    
    console.log(`Task created with id ${result.insertId}`);
    res.status(201).json({ 
      id: result.insertId, 
      title, 
      priority, 
      isCompleted: false,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update a specific task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority, isCompleted } = req.body;

  // Validate that id is a number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  // Validate required fields
  if (!title || !priority) {
    return res.status(400).json({ error: 'Title and priority are required' });
  }

  // Validate priority enum values
  const validPriorities = ['Low', 'Medium', 'High', 'low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
  }

  try {
    const query = `
      UPDATE tasks 
      SET title = ?, priority = ?, isCompleted = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      title,
      priority,
      isCompleted ?? false,
      id
    ]);

    // Verify that the update affected at least one row
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    console.log(`Task ${id} updated successfully`);
    res.json({
      id: Number(id),
      title,
      priority,
      isCompleted: isCompleted ?? false,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a specific task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  try {
    const query = "DELETE FROM tasks WHERE id = ?";
    const [result] = await db.query(query, [id]);

    // Verify that the delete affected at least one row
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    console.log(`Task ${id} deleted successfully`);
    res.json({ 
      id: parseInt(id),
      message: `Task with id ${id} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});


// ------- Execute server -------

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});