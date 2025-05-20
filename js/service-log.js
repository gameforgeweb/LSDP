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
    // Implement add service functionality
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
        // Implement edit functionality
    }
}

// Initial render
renderServiceLog(); 