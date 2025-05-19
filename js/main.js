// Domain Restriction
const ALLOWED_DOMAIN = 'gameforgeweb.github.io';

function validateDomain() {
    const currentHost = window.location.hostname;
    if (!currentHost.endsWith(ALLOWED_DOMAIN)) {
        // Clear all content and show error message
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: var(--primary-black);
                color: var(--text-white);
                text-align: center;
                padding: 2rem;
                font-family: 'Barlow', sans-serif;
            ">
                <h1 style="color: var(--silver); font-family: 'Racing Sans One', cursive; margin-bottom: 1rem;">
                    Access Denied
                </h1>
                <p style="margin-bottom: 1rem;">
                    This application is restricted to authorized domains only.
                </p>
                <p style="color: var(--light-silver);">
                    Please contact the administrator for access.
                </p>
            </div>
        `;
        return false;
    }
    return true;
}

// Data Storage Keys
const STORAGE_KEYS = {
    INVENTORY: 'lsDetails_inventory',
    TODO: 'lsDetails_todo',
    SERVICE_LOG: 'lsDetails_serviceLog',
    EXPENSES: 'lsDetails_expenses',
    IDEAS: 'lsDetails_ideas'
};

// Utility Functions
const storage = {
    save: (key, data) => {
        if (!validateDomain()) return false;
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    },

    load: (key) => {
        if (!validateDomain()) return null;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    clear: (key) => {
        if (!validateDomain()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
};

// CSV Export Function
const exportToCSV = (data, filename) => {
    if (!validateDomain()) return;
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Notification System
const notifications = {
    show: (message, type = 'info') => {
        if (!validateDomain()) return;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Form Validation
const validateForm = (formData, requiredFields) => {
    if (!validateDomain()) return { isValid: false, errors: { domain: 'Invalid domain' } };
    const errors = {};
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors[field] = `${field} is required`;
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Validate domain first
    if (!validateDomain()) return;

    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 