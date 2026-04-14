const API_URL = 'https://bootstrap-cqef.onrender.com/api/tasks';

let toDoList = [];
let editingTaskId = null;

// Referencias a los elementos del HTML
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');
const taskListTable = document.getElementById('task-list');

const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const editTitleInput = document.getElementById('edit-title');
const editPrioritySelect = document.getElementById('edit-priority');
const editCompletedCheckbox = document.getElementById('edit-completed');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// 1. OBTENER TAREAS
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        const data = await response.json();
        toDoList = data;
        renderTasks();
    } catch (error) {
        console.error("Error en fetchTasks:", error);
    }
}

// 2. CREAR TAREA
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        title: taskTitleInput.value,
        priority: taskPrioritySelect.value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        taskForm.reset();
        fetchTasks(); // Recargar lista
    } catch (error) {
        console.error("Error al crear:", error);
    }
});

// 3. DIBUJAR LA TABLA
function renderTasks() {
    taskListTable.innerHTML = '';
    toDoList.forEach(task => {
        taskListTable.innerHTML += `
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.priority}</td>
            <td>${task.completed ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEdit(${task.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        </tr>`;
    });
}

// 4. ABRIR FORMULARIO DE EDICIÓN
window.openEdit = function(id) {
    const task = toDoList.find(t => t.id == id);
    if (!task) return;
    
    editingTaskId = id;
    editTitleInput.value = task.title;
    editPrioritySelect.value = task.priority;
    editCompletedCheckbox.checked = task.completed;
    
    editSection.style.display = 'block';
    window.scrollTo(0, 0); // Sube la pantalla para ver el formulario
};

// 5. GUARDAR CAMBIOS (PUT)
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        title: editTitleInput.value,
        priority: editPrioritySelect.value,
        completed: editCompletedCheckbox.checked
    };

    try {
        await fetch(`${API_URL}/${editingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        editSection.style.display = 'none';
        fetchTasks();
    } catch (error) {
        console.error("Error al editar:", error);
    }
});

// 6. ELIMINAR TAREA
window.deleteTask = async function(id) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchTasks();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

// 7. CANCELAR EDICIÓN
cancelEditBtn.addEventListener('click', () => {
    editSection.style.display = 'none';
});

// Inicializar la carga
fetchTasks();