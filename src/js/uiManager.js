/**
 * UI Manager Module
 * Handles all DOM manipulation and UI rendering
 */

export const UIManager = {
    /**
     * Show loading spinner
     */
    showLoading() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.classList.add('active');
        }
    },

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.classList.remove('active');
        }
    },

    /**
     * Show notification message
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('active');
            
            setTimeout(() => {
                notification.classList.remove('active');
            }, duration);
        }
    },

    /**
     * Populate filter dropdowns
     * @param {Array} categories - Array of category objects
     * @param {Array} areas - Array of area objects
     */
    populateFilters(categories, areas) {
        const categorySelect = document.getElementById('categoryFilter');
        const areaSelect = document.getElementById('areaFilter');

        if (categorySelect && categories) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.strCategory;
                option.textContent = cat.strCategory;
                categorySelect.appendChild(option);
            });
        }

        if (areaSelect && areas) {
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area.strArea;
                option.textContent = area.strArea;
                areaSelect.appendChild(option);
            });
        }
    }
};