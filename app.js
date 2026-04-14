const API_URL = 'https://bootstrap-cqef.onrender.com/api/tasks';

let toDoList = [];

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');
const taskListTable = document.getElementById('task-list');

// Cargar tareas al iniciar
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la respuesta');
        const data = await response.json();
        toDoList = data;
        renderTasks();
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// Crear tarea
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        title: taskTitleInput.value,
        priority: taskPrioritySelect.value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });

    taskForm.reset();
    fetchTasks();
});

// Dibujar la tabla
function renderTasks() {
    taskListTable.innerHTML = '';
    toDoList.forEach(task => {
        taskListTable.innerHTML += `
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.priority}</td>
            <td>${task.completed ? 'Yes' : 'No'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        </tr>`;
    });
}

// Eliminar tarea
async function deleteTask(id) {
    if(confirm('¿Seguro?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

fetchTasks();