// Domain Restriction
const ALLOWED_DOMAIN = 'nyancat999.github.io';

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

// Animation and UI Enhancement
document.addEventListener('DOMContentLoaded', () => {
    // Add animation delays to navigation cards
    const navCards = document.querySelectorAll('.nav-card');
    navCards.forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });

    // Add animation delays to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.setProperty('--stat-index', index);
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading state to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('btn-danger')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 500);
            }
        });
    });

    // Enhanced form interactions
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Add hover effect to table rows
    document.querySelectorAll('table tr').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });

        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Enhanced modal interactions
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        
        modal.addEventListener('show', () => {
            content.style.transform = 'scale(0.95)';
            setTimeout(() => {
                content.style.transform = 'scale(1)';
            }, 50);
        });
    });

    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe elements that should fade in
    document.querySelectorAll('.table-container, .stats-container, .task-section').forEach(el => {
        observer.observe(el);
    });
});

// Enhanced notification system
const notifications = {
    show: (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Storage utility with enhanced error handling
const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            notifications.show('Error saving data', 'error');
            return false;
        }
    },
    
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            notifications.show('Error loading data', 'error');
            return null;
        }
    }
};

// Storage keys
const STORAGE_KEYS = {
    INVENTORY: 'lsd_inventory',
    TODO: 'lsd_todo',
    SERVICE_LOG: 'lsd_service_log',
    EXPENSES: 'lsd_expenses',
    IDEAS: 'lsd_ideas'
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
}); 
