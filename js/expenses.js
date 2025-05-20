class ExpenseManager {
    constructor() {
        this.expenses = storage.load(STORAGE_KEYS.EXPENSES) || [];
        this.modal = document.getElementById('expenseModal');
        this.form = document.getElementById('expenseForm');
        this.searchInput = document.getElementById('searchExpense');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');
        
        this.initializeEventListeners();
        this.renderExpenses();
        this.updateStats();
    }

    initializeEventListeners() {
        // Add Expense Button
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.openModal());
        
        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportExpenses());
        
        // Search Input
        this.searchInput.addEventListener('input', () => this.filterExpenses());
        
        // Category Filter
        this.categoryFilter.addEventListener('change', () => this.filterExpenses());
        
        // Date Range
        this.startDate.addEventListener('change', () => this.filterExpenses());
        this.endDate.addEventListener('change', () => this.filterExpenses());
        
        // Modal Close Button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Form Submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpense();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(expense = null) {
        this.modal.style.display = 'block';
        if (expense) {
            document.getElementById('modalTitle').textContent = 'Edit Expense';
            document.getElementById('expenseId').value = expense.id;
            document.getElementById('expenseDate').value = expense.date;
            document.getElementById('expenseItem').value = expense.item;
            document.getElementById('expenseCategory').value = expense.category;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('expenseNotes').value = expense.notes || '';
        } else {
            document.getElementById('modalTitle').textContent = 'Add Expense';
            document.getElementById('expenseId').value = '';
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            this.form.reset();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    saveExpense() {
        const formData = {
            id: document.getElementById('expenseId').value || Date.now().toString(),
            date: document.getElementById('expenseDate').value,
            item: document.getElementById('expenseItem').value,
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            notes: document.getElementById('expenseNotes').value
        };

        const validation = validateForm(formData, ['date', 'item', 'category', 'amount']);
        if (!validation.isValid) {
             notifications.show(`Please fill in the required field: ${validation.missingField}`, 'error');
            return;
        }

        // Also check if amount is a valid number
        if (isNaN(formData.amount)) {
            notifications.show('Please enter a valid amount', 'error');
            return;
        }

        const existingExpenseIndex = this.expenses.findIndex(e => e.id === formData.id);
        if (existingExpenseIndex !== -1) {
            this.expenses[existingExpenseIndex] = formData;
        } else {
            this.expenses.push(formData);
        }

        storage.save(STORAGE_KEYS.EXPENSES, this.expenses);
        this.renderExpenses();
        this.updateStats();
        this.closeModal();
        notifications.show('Expense saved successfully');
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            storage.save(STORAGE_KEYS.EXPENSES, this.expenses);
            this.renderExpenses();
            this.updateStats();
            notifications.show('Expense deleted successfully');
        }
    }

    filterExpenses() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const categoryFilter = this.categoryFilter.value;
        const startDate = this.startDate.value;
        const endDate = this.endDate.value;
        
        let filteredExpenses = this.expenses;
        
        if (searchTerm) {
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.item.toLowerCase().includes(searchTerm) ||
                (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        }
        
        if (startDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date >= startDate);
        }
        
        if (endDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date <= endDate);
        }
        
        this.renderExpenses(filteredExpenses);
    }

    updateStats() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyExpenses = this.expenses
            .filter(expense => new Date(expense.date) >= firstDayOfMonth)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const oldestExpense = this.expenses.length > 0 
            ? new Date(Math.min(...this.expenses.map(e => new Date(e.date))))
            : new Date();
        const monthsDiff = (now.getFullYear() - oldestExpense.getFullYear()) * 12 + 
            now.getMonth() - oldestExpense.getMonth() + 1;
        const averageMonthly = monthsDiff > 0 ? total / monthsDiff : 0;
        
        document.getElementById('totalExpenses').textContent = `$${total.toFixed(2)}`;
        document.getElementById('monthlyExpenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
        document.getElementById('averageExpenses').textContent = `$${averageMonthly.toFixed(2)}`;
    }

    renderExpenses(expenses = this.expenses) {
        const tbody = document.getElementById('expenseTableBody');
        tbody.innerHTML = '';

        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.item}</td>
                <td><span class="category-badge ${expense.category}">${expense.category}</span></td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.notes || '-'}</td>
                <td>
                    <button class="btn btn-small" onclick="expenseManager.openModal(${JSON.stringify(expense)})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="expenseManager.deleteExpense('${expense.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    exportExpenses() {
        const exportData = this.expenses.map(expense => ({
            'Date': expense.date,
            'Item': expense.item,
            'Category': expense.category,
            'Amount': `$${expense.amount.toFixed(2)}`,
            'Notes': expense.notes || ''
        }));
        
        exportToCSV(exportData, 'expenses_export');
    }
}

// Initialize Expense Manager
const expenseManager = new ExpenseManager(); 