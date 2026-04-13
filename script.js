// Usamos ruta relativa para que funcione en cualquier URL de Railway
const API_URL = '/api/tasks'; 

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');
const taskListTable = document.getElementById('task-list');

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        renderTasks(data);
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

function renderTasks(tasks) {
    taskListTable.innerHTML = '';
    tasks.forEach(task => {
        taskListTable.innerHTML += `
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.priority}</td>
            <td>${task.completed ? 'Si' : 'No'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Borrar</button>
            </td>
        </tr>`;
    });
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        title: taskTitleInput.value,
        priority: taskPrioritySelect.value,
        completed: false
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    taskForm.reset();
    fetchTasks();
});

async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}

fetchTasks();