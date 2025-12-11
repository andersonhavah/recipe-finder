/**
 * API Handler Module
 * Manages all API requests to TheMealDB
 */

export const APIHandler = {
    baseURL: 'https://www.themealdb.com/api/json/v1/1',

    /**
     * Search recipes by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of meal objects
     */
    async searchRecipes(query) {
        try {
            const response = await fetch(`${this.baseURL}/search.php?s=${query}`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error('Error searching recipes:', error);
            return [];
        }
    },

    /**
     * Get recipe by ID
     * @param {string} id - Recipe ID
     * @returns {Promise<Object|null>} Recipe object or null
     */
    async getRecipeById(id) {
        try {
            const response = await fetch(`${this.baseURL}/lookup.php?i=${id}`);
            const data = await response.json();
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            console.error('Error fetching recipe:', error);
            return null;
        }
    },

    /**
     * Get random recipe
     * @returns {Promise<Object|null>} Random recipe object or null
     */
    async getRandomRecipe() {
        try {
            const response = await fetch(`${this.baseURL}/random.php`);
            const data = await response.json();
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            console.error('Error fetching random recipe:', error);
            return null;
        }
    },

    /**
     * Filter recipes by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of meal objects
     */
    async filterByCategory(category) {
        try {
            const response = await fetch(`${this.baseURL}/filter.php?c=${category}`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error('Error filtering by category:', error);
            return [];
        }
    },

    /**
     * Filter recipes by area (cuisine)
     * @param {string} area - Area/cuisine name
     * @returns {Promise<Array>} Array of meal objects
     */
    async filterByArea(area) {
        try {
            const response = await fetch(`${this.baseURL}/filter.php?a=${area}`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error('Error filtering by area:', error);
            return [];
        }
    },

    /**
     * List all categories
     * @returns {Promise<Array>} Array of category objects
     */
    async listCategories() {
        try {
            const response = await fetch(`${this.baseURL}/categories.php`);
            const data = await response.json();
            return data.categories || [];
        } catch (error) {
            console.error('Error listing categories:', error);
            return [];
        }
    },

    /**
     * List all areas (cuisines)
     * @returns {Promise<Array>} Array of area objects
     */
    async listAreas() {
        try {
            const response = await fetch(`${this.baseURL}/list.php?a=list`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error('Error listing areas:', error);
            return [];
        }
    }
};