// Initialize service log data
let serviceLog = storage.load(STORAGE_KEYS.SERVICE_LOG) || [];

// DOM Elements
const serviceTableBody = document.getElementById('serviceTableBody');
const addServiceBtn = document.getElementById('addServiceBtn');
const exportBtn = document.getElementById('exportBtn');
const searchService = document.getElementById('searchService');
const dateFilter = document.getElementById('dateFilter');
const todayCount = document.getElementById('todayCount');
const weekCount = document.getElementById('weekCount');
const monthCount = document.getElementById('monthCount');

// Event Listeners
addServiceBtn.addEventListener('click', () => {
    this.openModal();
});

exportBtn.addEventListener('click', () => {
    exportToCSV(serviceLog, 'service_log');
});

searchService.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredLog = serviceLog.filter(service => 
        service.carModel.toLowerCase().includes(searchTerm) ||
        service.servicePerformed.toLowerCase().includes(searchTerm)
    );
    renderServiceLog(filteredLog);
});

dateFilter.addEventListener('change', (e) => {
    const selectedDate = new Date(e.target.value);
    const filteredLog = serviceLog.filter(service => 
        new Date(service.date).toDateString() === selectedDate.toDateString()
    );
    renderServiceLog(filteredLog);
});

// Render service log table
function renderServiceLog(data = serviceLog) {
    serviceTableBody.innerHTML = '';
    
    data.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(service.date)}</td>
            <td>${service.carModel}</td>
            <td>${service.servicePerformed}</td>
            <td>${service.customerNotes}</td>
            <td>${formatDate(service.nextServiceDue)}</td>
            <td>
                <button class="btn btn-small" onclick="editService('${service.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteService('${service.id}')">Delete</button>
            </td>
        `;
        serviceTableBody.appendChild(row);
    });

    updateStats();
}

// Update statistics
function updateStats() {
    const today = new Date().toDateString();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);

    todayCount.textContent = serviceLog.filter(service => 
        new Date(service.date).toDateString() === today
    ).length;

    weekCount.textContent = serviceLog.filter(service => 
        new Date(service.date) >= weekStart
    ).length;

    monthCount.textContent = serviceLog.filter(service => 
        new Date(service.date) >= monthStart
    ).length;
}

// Delete service
function deleteService(id) {
    confirmDelete('Are you sure you want to delete this service record?', () => {
        if (deleteItem(serviceLog, id, STORAGE_KEYS.SERVICE_LOG)) {
            renderServiceLog();
        }
    });
}

// Edit service
function editService(id) {
    const service = serviceLog.find(service => service.id === id);
    if (service) {
        serviceManager.openModal(service);
    }
}

// Initial render
renderServiceLog();

class ServiceManager {
    constructor() {
        this.serviceLog = storage.load(STORAGE_KEYS.SERVICE_LOG) || [];
        this.modal = document.getElementById('serviceModal');
        this.form = document.getElementById('serviceForm');
        this.searchInput = document.getElementById('searchService');
        this.dateFilter = document.getElementById('dateFilter');
        this.todayCount = document.getElementById('todayCount');
        this.weekCount = document.getElementById('weekCount');
        this.monthCount = document.getElementById('monthCount');

        this.initializeEventListeners();
        this.renderServiceLog();
        this.updateStats();
    }

    initializeEventListeners() {
        // Add Service Button
        document.getElementById('addServiceBtn').addEventListener('click', () => this.openModal());

        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportServiceLog());

        // Search Input
        this.searchInput.addEventListener('input', () => this.filterServiceLog());

        // Date Filter
        this.dateFilter.addEventListener('change', () => this.filterServiceLog());

        // Modal Close Button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());

        // Form Submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveService();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(service = null) {
        this.modal.style.display = 'block';
        if (service) {
            document.getElementById('modalTitle').textContent = 'Edit Service Record';
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceDate').value = service.date;
            document.getElementById('carModel').value = service.carModel;
            document.getElementById('serviceType').value = service.servicePerformed;
            document.getElementById('customerNotes').value = service.customerNotes || '';
            document.getElementById('nextService').value = service.nextServiceDue || '';
        } else {
            document.getElementById('modalTitle').textContent = 'Add Service Record';
            document.getElementById('serviceId').value = '';
            document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
            this.form.reset();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    saveService() {
        const formData = {
            id: document.getElementById('serviceId').value || Date.now().toString(),
            date: document.getElementById('serviceDate').value,
            carModel: document.getElementById('carModel').value,
            servicePerformed: document.getElementById('serviceType').value,
            customerNotes: document.getElementById('customerNotes').value,
            nextServiceDue: document.getElementById('nextService').value
        };

        const validation = validateForm(formData, ['date', 'carModel', 'servicePerformed']);
        if (!validation.isValid) {
            notifications.show(`Please fill in the required field: ${validation.missingField}`, 'error');
            return;
        }

        const existingServiceIndex = this.serviceLog.findIndex(s => s.id === formData.id);
        if (existingServiceIndex !== -1) {
            this.serviceLog[existingServiceIndex] = formData;
        } else {
            this.serviceLog.push(formData);
        }

        storage.save(STORAGE_KEYS.SERVICE_LOG, this.serviceLog);
        this.renderServiceLog();
        this.updateStats();
        this.closeModal();
        notifications.show('Service record saved successfully');
    }

    deleteService(id) {
        confirmDelete('Are you sure you want to delete this service record?', () => {
            if (deleteItem(this.serviceLog, id, STORAGE_KEYS.SERVICE_LOG)) {
                this.renderServiceLog();
                this.updateStats();
            }
        });
    }

    filterServiceLog() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const dateFilterValue = this.dateFilter.value;

        let filteredLog = this.serviceLog;

        if (searchTerm) {
            filteredLog = filteredLog.filter(service =>
                service.carModel.toLowerCase().includes(searchTerm) ||
                service.servicePerformed.toLowerCase().includes(searchTerm) ||
                (service.customerNotes && service.customerNotes.toLowerCase().includes(searchTerm))
            );
        }

        if (dateFilterValue) {
            filteredLog = filteredLog.filter(service => service.date === dateFilterValue);
        }

        this.renderServiceLog(filteredLog);
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        document.getElementById('todayCount').textContent = this.serviceLog.filter(service => service.date === today).length;
        document.getElementById('weekCount').textContent = this.serviceLog.filter(service => service.date >= weekStart).length;
        document.getElementById('monthCount').textContent = this.serviceLog.filter(service => service.date >= monthStart).length;
    }

    renderServiceLog(data = this.serviceLog) {
        serviceTableBody.innerHTML = '';

        data.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(service.date)}</td>
                <td>${service.carModel}</td>
                <td>${service.servicePerformed}</td>
                <td>${service.customerNotes || '-'}</td>
                <td>${service.nextServiceDue ? formatDate(service.nextServiceDue) : '-'}</td>
                <td>
                    <button class="btn btn-small" onclick="serviceManager.openModal(${JSON.stringify(service)})" aria-label="Edit Service"></button>
                    <button class="btn btn-small btn-danger" onclick="serviceManager.deleteService('${service.id}')" aria-label="Delete Service"></button>
                </td>
            `;
             // Add text to buttons
            row.querySelector('.btn-small:not(.btn-danger)').textContent = 'Edit';
            row.querySelector('.btn-small.btn-danger').textContent = 'Delete';
            serviceTableBody.appendChild(row);
        });
    }

    exportServiceLog() {
         const exportData = this.serviceLog.map(service => ({
            'Date': service.date,
            'Car Model': service.carModel,
            'Service Performed': service.servicePerformed,
            'Customer Notes': service.customerNotes || '',
            'Next Service Due': service.nextServiceDue || ''
        }));

        exportToCSV(exportData, 'service_log_export');
    }
}

// Initialize Service Manager
const serviceManager = new ServiceManager(); 