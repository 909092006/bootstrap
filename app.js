// CORRECCIÓN IMPORTANTE: 
// Usamos '/' para que funcione tanto en tu PC como en Railway automáticamente.
const API_URL = '/api/tasks'; 

let toDoList = [];
let editingTaskId = null;

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');

const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const editTitleInput = document.getElementById('edit-title');
const editPrioritySelect = document.getElementById('edit-priority');
const editCompletedCheckbox = document.getElementById('edit-completed');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const taskListTable = document.getElementById('task-list');

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        toDoList = data;
        renderTasks();
    } catch (error) {
        console.error("Error al obtener tareas:", error);
    }
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

function renderTasks() {
    taskListTable.innerHTML = '';

    toDoList.forEach(task => {
        const completed = task.completed ? 'Yes' : 'No';

        taskListTable.innerHTML += `
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.priority}</td>
            <td>${completed}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${task.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${task.id}">Delete</button>
            </td>
        </tr>`;
    });
}

taskListTable.addEventListener('click', (e) => {
    if(e.target.classList.contains('edit-btn')){
        openEdit(e.target.dataset.id);
    }
    if(e.target.classList.contains('delete-btn')){
        deleteTask(e.target.dataset.id);
    }
});

function openEdit(id){
    const task = toDoList.find(t => t.id == id);
    if(!task) return;
    
    editingTaskId = id;

    editTitleInput.value = task.title;
    editPrioritySelect.value = task.priority;
    editCompletedCheckbox.checked = task.completed;

    editSection.style.display = 'block';
}

editForm.addEventListener('submit', async (e)=>{
    e.preventDefault();

    const taskData = {
        title: editTitleInput.value,
        priority: editPrioritySelect.value,
        completed: editCompletedCheckbox.checked
    };

    await fetch(`${API_URL}/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });

    editSection.style.display = 'none';
    fetchTasks();
});

async function deleteTask(id){
    if(confirm('¿Estás seguro de eliminar esta tarea?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

cancelEditBtn.addEventListener('click', ()=>{
    editSection.style.display = 'none';
});

fetchTasks();