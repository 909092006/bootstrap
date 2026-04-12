// ==========================================
// TASK MANAGER APP - Complete CRUD
// ==========================================

const API_URL = 'http://localhost:3000/api/tasks/';

// Global state
let toDoList = [];
let editingTaskId = null;

// ==========================================
// DOM REFERENCES
// ==========================================

// CREATE FORM
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');
const submitBtn = document.getElementById('submit-btn');

// EDIT FORM
const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const editTitleInput = document.getElementById('edit-title');
const editPrioritySelect = document.getElementById('edit-priority');
const editCompletedCheckbox = document.getElementById('edit-completed');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// TABLE
const taskListTable = document.getElementById('task-list');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Capitalize priority: "low" -> "Low"
 */
const capitalizePriority = (priority) => {
    if (!priority) return '';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

/**
 * Show user alert
 */
const showAlert = (message, isError = false) => {
    if (isError) {
        console.error('❌ ALERT:', message);
    } else {
        console.log('✅ ALERT:', message);
    }
    alert(message);
};

/**
 * Get color for priority badge
 */
const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
        case 'high':
            return '#dc3545';     // Red
        case 'medium':
            return '#ffc107';     // Yellow
        case 'low':
            return '#28a745';     // Green
        default:
            return '#6c757d';     // Gray
    }
};

/**
 * Hide edit section and reset
 */
const hideEditSection = () => {
    editSection.style.display = 'none';
    editingTaskId = null;
    editForm.reset();
};

/**
 * Show edit section
 */
const showEditSection = () => {
    editSection.style.display = 'block';
    editSection.scrollIntoView({ behavior: 'smooth' });
};

// ==========================================
// API CALLS
// ==========================================

/**
 * GET all tasks
 */
async function fetchTasks() {
    try {
        console.log('🔄 Fetching tasks from API:', API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        toDoList = Array.isArray(data) ? data : [];
        console.log('✅ Tasks loaded:', toDoList.length, 'tasks');
        console.log('📊 Task IDs and types:', toDoList.map(t => ({ id: t.id, type: typeof t.id, title: t.title })));
        renderTasks();
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        showAlert('Error loading tasks. Verify server is running at ' + API_URL, true);
    }
}

/**
 * POST - Create a new task
 */
async function createTask(title, priority) {
    try {
        const taskData = {
            title: title.trim(),
            priority: capitalizePriority(priority)
        };

        console.log('📝 Creating task:', taskData);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create task');
        }

        const createdTask = await response.json();
        console.log('✅ Task created:', createdTask);
        
        // Refresh and reset
        await fetchTasks();
        taskForm.reset();
        showAlert('Task created successfully!');
        
        return true;
    } catch (error) {
        console.error('❌ Error creating task:', error);
        showAlert('Error: ' + error.message, true);
        return false;
    }
}

/**
 * PUT - Update a task
 */
async function updateTask(taskId, title, priority, isCompleted) {
    try {
        // Convert to number explicitly
        const numericId = parseInt(String(taskId), 10);
        
        // Capitalize priority correctly
        const capitalizedPriority = capitalizePriority(priority);

        const taskData = {
            title: title.trim(),
            priority: capitalizedPriority,
            isCompleted: Boolean(isCompleted)
        };

        console.log(`📝 Updating task ${numericId}`);
        console.log('📤 Sending data:', taskData);
        console.log('🔗 Fetch URL:', `${API_URL}${numericId}`);

        const response = await fetch(`${API_URL}${numericId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Server error response:', errorData);
            throw new Error(errorData.error || 'Failed to update task');
        }

        const updatedTask = await response.json();
        console.log('✅ Task updated successfully:', updatedTask);
        
        // Refresh and reset
        await fetchTasks();
        hideEditSection();
        showAlert('Task updated successfully!');
        
        return true;
    } catch (error) {
        console.error('❌ Error updating task:', error);
        showAlert('Error: ' + error.message, true);
        return false;
    }
}

/**
 * DELETE - Remove a task
 */
async function deleteTaskFromAPI(taskId) {
    try {
        // Convert to number explicitly
        const numericId = parseInt(String(taskId), 10);
        console.log('🗑️ Delete requested for task ID:', taskId, '→ Numeric ID:', numericId);
        
        const confirmed = confirm('Are you sure you want to delete this task?');
        if (!confirmed) {
            console.log('ℹ️ Deletion cancelled by user');
            return false;
        }

        console.log(`🗑️ Deleting task ${numericId}`);

        const response = await fetch(`${API_URL}${numericId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete task');
        }

        const result = await response.json();
        console.log('✅ Task deleted:', result);
        
        // If we were editing this task, reset
        if (editingTaskId === numericId) {
            console.log('🔄 Was editing deleted task, hiding edit section');
            hideEditSection();
        }
        
        // Refresh list
        await fetchTasks();
        showAlert('Task deleted successfully!');
        
        return true;
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        showAlert('Error: ' + error.message, true);
        return false;
    }
}

// ==========================================
// RENDERING
// ==========================================

/**
 * Render all tasks in table
 */
const renderTasks = () => {
    taskListTable.innerHTML = '';

    if (toDoList.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center text-muted py-4">No tasks yet. Create one!</td>';
        taskListTable.appendChild(emptyRow);
        return;
    }

    toDoList.forEach(task => {
        const row = document.createElement('tr');
        const isCompletedText = task.isCompleted ? 'Yes' : 'No';
        const completedClass = task.isCompleted ? 'text-decoration-line-through text-muted' : '';

        row.innerHTML = `
            <td>${task.id}</td>
            <td class="${completedClass}">${task.title}</td>
            <td>
                <span class="badge" style="background-color: ${getPriorityColor(task.priority)}">
                    ${task.priority}
                </span>
            </td>
            <td>${isCompletedText}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" data-action="edit" data-id="${task.id}">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${task.id}">
                    Delete
                </button>
            </td>
        `;

        taskListTable.appendChild(row);
    });

    console.log('✅ Tasks rendered:', toDoList.length);
};

/**
 * Load task into edit form
 */
const loadTaskIntoEditForm = (taskId) => {
    // Convert taskId to number safely with radix parameter
    const numericId = parseInt(String(taskId), 10);
    
    console.log('🔍 Loading task. ID from button:', taskId, '→ Converted to:', numericId);
    console.log('📊 Available task IDs:', toDoList.map(t => ({ id: t.id, type: typeof t.id })));
    
    // Find task with explicit type conversion
    const task = toDoList.find(t => {
        const taskIdNum = parseInt(String(t.id), 10);
        console.log('  Comparing:', taskIdNum, '===', numericId, '→', taskIdNum === numericId);
        return taskIdNum === numericId;
    });
    
    if (!task) {
        console.error('❌ Task not found. Searched for ID:', numericId);
        showAlert('Task not found', true);
        return;
    }

    console.log('✅ Task found:', task);

    // Fill edit form with task data
    editTitleInput.value = task.title || '';
    editPrioritySelect.value = (task.priority || '').toLowerCase();
    editCompletedCheckbox.checked = Boolean(task.isCompleted);
    
    console.log('📋 Form filled with:');
    console.log('  Title:', editTitleInput.value);
    console.log('  Priority:', editPrioritySelect.value);
    console.log('  Completed:', editCompletedCheckbox.checked);
    
    // Set editing state
    editingTaskId = numericId;
    console.log('🔐 editingTaskId set to:', editingTaskId, '(type:', typeof editingTaskId, ')');
    
    // Show edit section
    showEditSection();
    
    console.log('✔️ Edit form displayed for task ID:', editingTaskId);
};

/**
 * EVENT DELEGATION: Handle all Edit and Delete button clicks from the table
 * This listener is attached ONCE and handles all button clicks dynamically
 */
const setupTableEventDelegation = () => {
    // DEFENSIVE: Validate that taskListTable exists
    if (!taskListTable) {
        console.error('❌ setupTableEventDelegation: taskListTable is null!');
        console.error('   This means Index.html is missing: <tbody id="task-list"></tbody>');
        return;
    }
    
    taskListTable.addEventListener('click', (event) => {
        const editButton = event.target.closest('button[data-action="edit"]');
        const deleteButton = event.target.closest('button[data-action="delete"]');

        if (editButton) {
            event.preventDefault();
            const taskId = editButton.getAttribute('data-id');
            console.log('🖱️ Edit button clicked. Task ID from data-id:', taskId);
            loadTaskIntoEditForm(taskId);
        } else if (deleteButton) {
            event.preventDefault();
            const taskId = deleteButton.getAttribute('data-id');
            console.log('🖱️ Delete button clicked. Task ID:', taskId);
            deleteTaskFromAPI(parseInt(String(taskId), 10));
        }
    });
    console.log('✅ Table event delegation setup complete (ONE-TIME SETUP)');
};

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * CREATE FORM SUBMIT
 */
taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const priority = taskPrioritySelect.value;

    console.log('➕ CREATE FORM SUBMITTED');
    console.log('  Title:', title);
    console.log('  Priority:', priority);

    if (!title) {
        showAlert('Please enter a task title', true);
        taskTitleInput.focus();
        return;
    }

    if (!priority) {
        showAlert('Please select a priority', true);
        taskPrioritySelect.focus();
        return;
    }

    await createTask(title, priority);
});

/**
 * EDIT FORM SUBMIT
 */
editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 EDIT FORM SUBMITTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 editingTaskId:', editingTaskId, '(type:', typeof editingTaskId, ')');

    if (editingTaskId === null || editingTaskId === undefined) {
        console.error('❌ No task ID set');
        showAlert('No task selected for editing', true);
        return;
    }

    const title = editTitleInput.value.trim();
    const priority = editPrioritySelect.value;
    const isCompleted = editCompletedCheckbox.checked;

    console.log('📋 Form values:', { title, priority, isCompleted });

    if (!title) {
        showAlert('Please enter a task title', true);
        editTitleInput.focus();
        return;
    }

    if (!priority) {
        showAlert('Please select a priority', true);
        editPrioritySelect.focus();
        return;
    }

    console.log('💾 Calling updateTask with ID:', editingTaskId);
    await updateTask(editingTaskId, title, priority, isCompleted);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

/**
 * CANCEL EDIT BUTTON
 */
cancelEditBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideEditSection();
    console.log('Editing cancelled');
});

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Task Manager App initialized');
    
    // CRITICAL: Validate that taskListTable exists
    if (!taskListTable) {
        console.error('❌ CRITICAL ERROR: taskListTable element not found!');
        console.error('   Make sure Index.html has: <tbody id="task-list"></tbody>');
        alert('Error: HTML structure is incorrect. Check that <tbody id="task-list"> exists.');
        return;  // Stop execution
    }
    
    console.log('✅ DOM element taskListTable found and valid');
    
    // Load initial tasks FIRST
    // This will render the table
    fetchTasks().then(() => {
        console.log('📋 Tasks loaded, now setting up event delegation');
        
        // Setup event delegation AFTER table is rendered
        // This ensures buttons exist before we attach listeners
        setupTableEventDelegation();
    });
});
