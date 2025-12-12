/**
 * Storage Manager Module
 * Handles all localStorage operations for the application
 */

export const StorageManager = {
    /**
     * Save favorites to localStorage
     * @param {Array} favorites - Array of recipe IDs
     */
    saveFavorites(favorites) {
        try {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    },

    /**
     * Get favorites from localStorage
     * @returns {Array} Array of recipe IDs
     */
    getFavorites() {
        try {
            const favorites = localStorage.getItem('favorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    },

    /**
     * Save meal plan to localStorage
     * @param {Object} mealPlan - Meal plan object
     */
    saveMealPlan(mealPlan) {
        try {
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        } catch (error) {
            console.error('Error saving meal plan:', error);
        }
    },

    /**
     * Get meal plan from localStorage
     * @returns {Object} Meal plan object
     */
    getMealPlan() {
        try {
            const mealPlan = localStorage.getItem('mealPlan');
            return mealPlan ? JSON.parse(mealPlan) : this.getEmptyMealPlan();
        } catch (error) {
            console.error('Error loading meal plan:', error);
            return this.getEmptyMealPlan();
        }
    },

    /**
     * Save user preferences
     * @param {Object} preferences - User preferences object
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem('preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    },

    /**
     * Get user preferences from localStorage
     * @returns {Object} Preferences object
     */
    getPreferences() {
        try {
            const preferences = localStorage.getItem('preferences');
            return preferences ? JSON.parse(preferences) : { 
                lastCategory: '', 
                lastArea: '' 
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            return { lastCategory: '', lastArea: '' };
        }
    },

    /**
     * Get empty meal plan structure
     * @returns {Object} Empty meal plan with all days and meal types
     */
    getEmptyMealPlan() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const plan = {};
        
        days.forEach(day => {
            plan[day] = {};
            mealTypes.forEach(type => {
                plan[day][type] = null;
            });
        });
        
        return plan;
    }
};