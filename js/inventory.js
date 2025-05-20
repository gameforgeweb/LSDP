// Inventory Management
class InventoryManager {
    constructor() {
        this.items = storage.load(STORAGE_KEYS.INVENTORY) || [];
        this.modal = document.getElementById('itemModal');
        this.form = document.getElementById('itemForm');
        this.searchInput = document.getElementById('searchInventory');
        
        this.initializeEventListeners();
        this.renderInventory();
    }

    initializeEventListeners() {
        // Add Item Button
        document.getElementById('addItemBtn').addEventListener('click', () => this.openModal());
        
        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportInventory());
        
        // Search Input
        this.searchInput.addEventListener('input', () => this.filterInventory());
        
        // Modal Close Button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Form Submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(item = null) {
        console.log('Opening Inventory Modal with item:', item);
        this.modal.style.display = 'block';
        if (item) {
            document.getElementById('modalTitle').textContent = 'Edit Item';
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('reorderLevel').value = item.reorderLevel;
        } else {
            document.getElementById('modalTitle').textContent = 'Add New Item';
            this.form.reset();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    saveItem() {
        const formData = {
            id: document.getElementById('itemId').value || Date.now().toString(),
            name: document.getElementById('itemName').value,
            quantity: parseInt(document.getElementById('quantity').value),
            reorderLevel: parseInt(document.getElementById('reorderLevel').value),
            lastUpdated: new Date().toLocaleDateString()
        };

        console.log('Saving Inventory Item - formData:', formData);

        const validation = validateForm(formData, ['name', 'quantity', 'reorderLevel']);
        
        console.log('Validation Result:', validation);

        if (!validation.isValid) {
            notifications.show('Please fill in all required fields', 'error');
            return;
        }

        const existingItemIndex = this.items.findIndex(item => item.id === formData.id);
        if (existingItemIndex !== -1) {
            this.items[existingItemIndex] = formData;
        } else {
            this.items.push(formData);
        }

        storage.save(STORAGE_KEYS.INVENTORY, this.items);
        this.renderInventory();
        this.closeModal();
        notifications.show('Item saved successfully');
    }

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.items = this.items.filter(item => item.id !== id);
            storage.save(STORAGE_KEYS.INVENTORY, this.items);
            this.renderInventory();
            notifications.show('Item deleted successfully');
        }
    }

    getStatus(quantity, reorderLevel) {
        if (quantity === 0) return 'Out';
        if (quantity <= reorderLevel) return 'Low';
        return 'OK';
    }

    renderInventory(items = this.items) {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';

        items.forEach(item => {
            const status = this.getStatus(item.quantity, item.reorderLevel);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.reorderLevel}</td>
                <td class="status-${status.toLowerCase()}">${status}</td>
                <td>${item.lastUpdated}</td>
                <td>
                    <button class="btn btn-small" onclick="inventoryManager.openModal(${JSON.stringify(item)})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="inventoryManager.deleteItem('${item.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterInventory() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredItems = this.items.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        this.renderInventory(filteredItems);
    }

    exportInventory() {
        const exportData = this.items.map(item => ({
            'Item Name': item.name,
            'Quantity in Stock': item.quantity,
            'Reorder Level': item.reorderLevel,
            'Status': this.getStatus(item.quantity, item.reorderLevel),
            'Last Updated': item.lastUpdated
        }));
        
        exportToCSV(exportData, 'inventory_export');
    }
}

// Initialize Inventory Manager
const inventoryManager = new InventoryManager(); 