// Export to CSV functionality
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        notifications.show('No data to export', 'error');
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete functionality
function deleteItem(array, id, storageKey) {
    const index = array.findIndex(item => item.id === id);
    if (index === -1) {
        notifications.show('Item not found', 'error');
        return false;
    }

    array.splice(index, 1);
    storage.save(storageKey, array);
    notifications.show('Item deleted successfully', 'success');
    return true;
}

// Confirm delete
function confirmDelete(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
} 