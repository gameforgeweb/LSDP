class IdeasManager {
    constructor() {
        this.ideas = storage.load(STORAGE_KEYS.IDEAS) || [];
        this.modal = document.getElementById('ideaModal');
        this.form = document.getElementById('ideaForm');
        this.searchInput = document.getElementById('searchIdeas');
        this.statusFilter = document.getElementById('statusFilter');
        
        this.initializeEventListeners();
        this.renderIdeas();
    }

    initializeEventListeners() {
        // Add Idea Button
        document.getElementById('addIdeaBtn').addEventListener('click', () => this.openModal());
        
        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportIdeas());
        
        // Search Input
        this.searchInput.addEventListener('input', () => this.filterIdeas());
        
        // Status Filter
        this.statusFilter.addEventListener('change', () => this.filterIdeas());
        
        // Modal Close Button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Form Submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIdea();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(idea = null) {
        this.modal.style.display = 'block';
        if (idea) {
            document.getElementById('modalTitle').textContent = 'Edit Idea';
            document.getElementById('ideaId').value = idea.id;
            document.getElementById('ideaTitle').value = idea.title;
            document.getElementById('ideaDescription').value = idea.description;
            document.getElementById('ideaStatus').value = idea.status;
            document.getElementById('ideaPriority').value = idea.priority;
            document.getElementById('ideaNotes').value = idea.notes || '';
        } else {
            document.getElementById('modalTitle').textContent = 'Add New Idea';
            document.getElementById('ideaId').value = '';
            this.form.reset();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    saveIdea() {
        const formData = {
            id: document.getElementById('ideaId').value || Date.now().toString(),
            title: document.getElementById('ideaTitle').value,
            description: document.getElementById('ideaDescription').value,
            status: document.getElementById('ideaStatus').value,
            priority: document.getElementById('ideaPriority').value,
            notes: document.getElementById('ideaNotes').value,
            dateAdded: new Date().toISOString()
        };

        console.log('Saving Idea - formData:', formData);

        const validation = validateForm(formData, ['title', 'description', 'status', 'priority']);
         
        console.log('Validation Result:', validation);

        if (!validation.isValid) {
             notifications.show(`Please fill in the required field: ${validation.missingField}`, 'error');
            return;
        }

        const existingIdeaIndex = this.ideas.findIndex(i => i.id === formData.id);
        if (existingIdeaIndex !== -1) {
            this.ideas[existingIdeaIndex] = formData;
        } else {
            this.ideas.push(formData);
        }

        storage.save(STORAGE_KEYS.IDEAS, this.ideas);
        this.renderIdeas();
        this.closeModal();
        notifications.show('Idea saved successfully');
    }

    deleteIdea(id) {
        if (confirm('Are you sure you want to delete this idea?')) {
            this.ideas = this.ideas.filter(idea => idea.id !== id);
            storage.save(STORAGE_KEYS.IDEAS, this.ideas);
            this.renderIdeas();
            notifications.show('Idea deleted successfully');
        }
    }

    filterIdeas() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const statusFilter = this.statusFilter.value;
        
        let filteredIdeas = this.ideas;
        
        if (searchTerm) {
            filteredIdeas = filteredIdeas.filter(idea => 
                idea.title.toLowerCase().includes(searchTerm) ||
                idea.description.toLowerCase().includes(searchTerm) ||
                (idea.notes && idea.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        if (statusFilter !== 'all') {
            filteredIdeas = filteredIdeas.filter(idea => idea.status === statusFilter);
        }
        
        this.renderIdeas(filteredIdeas);
    }

    renderIdeas(ideas = this.ideas) {
        const grid = document.getElementById('ideasGrid');
        grid.innerHTML = '';

        ideas.forEach(idea => {
            const card = document.createElement('div');
            card.className = `idea-card ${idea.status} ${idea.priority}`;
            card.innerHTML = `
                <div class="idea-header">
                    <h3>${idea.title}</h3>
                    <span class="status-badge ${idea.status}">${idea.status}</span>
                </div>
                <p class="idea-description">${idea.description}</p>
                ${idea.notes ? `<p class="idea-notes">${idea.notes}</p>` : ''}
                <div class="idea-footer">
                    <span class="priority-badge ${idea.priority}">${idea.priority}</span>
                    <div class="idea-actions">
                        <button class="btn btn-small" onclick="ideasManager.openModal(${JSON.stringify(idea)})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="ideasManager.deleteIdea('${idea.id}')">Delete</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    exportIdeas() {
        const exportData = this.ideas.map(idea => ({
            'Title': idea.title,
            'Description': idea.description,
            'Status': idea.status,
            'Priority': idea.priority,
            'Notes': idea.notes || '',
            'Date Added': new Date(idea.dateAdded).toLocaleDateString()
        }));
        
        exportToCSV(exportData, 'ideas_export');
    }
}

// Initialize Ideas Manager
const ideasManager = new IdeasManager(); 