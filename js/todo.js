// Default tasks for each section
const DEFAULT_TASKS = {
    morning: [],
    service: [],
    end: []
};

class TodoManager {
    constructor() {
        // Clear existing tasks on initialization for this specific request
        this.tasks = this.initializeDefaultTasks(); // This will now initialize with empty arrays
        storage.save(STORAGE_KEYS.TODO, this.tasks); // Save the empty state
        
        this.modal = document.getElementById('taskModal');
        this.form = document.getElementById('taskForm');
        
        this.initializeEventListeners();
        this.renderTasks();
        this.updateProgress();
    }

    initializeEventListeners() {
        // Add Task Button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
        
        // Reset Tasks Button
        document.getElementById('resetTasksBtn').addEventListener('click', () => this.resetCompletedTasks());
        
        // Modal Close Button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Form Submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomTask();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    initializeDefaultTasks() {
        const tasks = {};
        Object.keys(DEFAULT_TASKS).forEach(section => {
            tasks[section] = DEFAULT_TASKS[section].map(task => ({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: task,
                completed: false,
                isDefault: true
            }));
        });
        storage.save(STORAGE_KEYS.TODO, tasks);
        return tasks;
    }

    openModal() {
        this.modal.style.display = 'block';
        this.form.reset();
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    addCustomTask() {
        const taskName = document.getElementById('taskName').value;
        const section = document.getElementById('taskSection').value;

        if (!taskName.trim()) {
            notifications.show('Please enter a task name', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            completed: false,
            isDefault: false
        };

        this.tasks[section].push(newTask);
        storage.save(STORAGE_KEYS.TODO, this.tasks);
        this.renderTasks();
        this.closeModal();
        notifications.show('Task added successfully');
    }

    toggleTask(section, taskId) {
        const task = this.tasks[section].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            storage.save(STORAGE_KEYS.TODO, this.tasks);
            this.renderTasks();
            this.updateProgress();
        }
    }

    deleteTask(section, taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks[section] = this.tasks[section].filter(task => task.id !== taskId);
            storage.save(STORAGE_KEYS.TODO, this.tasks);
            this.renderTasks();
            this.updateProgress();
            notifications.show('Task deleted successfully');
        }
    }

    resetCompletedTasks() {
        if (confirm('Are you sure you want to reset all completed tasks?')) {
            Object.keys(this.tasks).forEach(section => {
                this.tasks[section].forEach(task => {
                    task.completed = false;
                });
            });
            storage.save(STORAGE_KEYS.TODO, this.tasks);
            this.renderTasks();
            this.updateProgress();
            notifications.show('Tasks reset successfully');
        }
    }

    updateProgress() {
        let totalTasks = 0;
        let completedTasks = 0;

        Object.values(this.tasks).forEach(sectionTasks => {
            sectionTasks.forEach(task => {
                totalTasks++;
                if (task.completed) completedTasks++;
            });
        });

        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        document.getElementById('taskProgress').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete`;
    }

    renderTasks() {
        Object.keys(this.tasks).forEach(section => {
            const container = document.getElementById(`${section}Tasks`);
            container.innerHTML = '';

            this.tasks[section].forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.innerHTML = `
                    <label class="task-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-name">${task.name}</span>
                    </label>
                    
                        <button class="btn btn-small btn-danger" onclick="todoManager.deleteTask('${section}', '${task.id}')">
                            Delete
                        </button>
                    
                `;

                const checkbox = taskElement.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => this.toggleTask(section, task.id));

                container.appendChild(taskElement);
            });
        });
    }
}

// Initialize Todo Manager
const todoManager = new TodoManager(); 