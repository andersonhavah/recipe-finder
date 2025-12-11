/**
 * Recipe Service Module
 * Processes and transforms recipe data from the API
 */

export const RecipeService = {
    /**
     * Parse ingredients from meal object
     * @param {Object} meal - Meal object from API
     * @returns {Array} Array of ingredient objects
     */
    parseIngredients(meal) {
        const ingredients = [];
        
        // API provides ingredients and measures in separate fields (1-20)
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient.trim(),
                    measure: measure ? measure.trim() : ''
                });
            }
        }
        
        return ingredients;
    },

    /**
     * Process a single recipe from API data
     * @param {Object} meal - Raw meal object from API
     * @returns {Object|null} Processed recipe object
     */
    processRecipe(meal) {
        if (!meal) return null;
        
        return {
            id: meal.idMeal,
            name: meal.strMeal,
            image: meal.strMealThumb,
            category: meal.strCategory || 'Uncategorized',
            area: meal.strArea || 'International',
            instructions: meal.strInstructions || 'No instructions available',
            ingredients: this.parseIngredients(meal),
            tags: meal.strTags ? meal.strTags.split(',').map(tag => tag.trim()) : [],
            youtube: meal.strYoutube || null
        };
    },

    /**
     * Process multiple recipes
     * @param {Array} meals - Array of meal objects from API
     * @returns {Array} Array of processed recipe objects
     */
    processRecipes(meals) {
        if (!meals || !Array.isArray(meals)) return [];
        return meals.map(meal => this.processRecipe(meal)).filter(recipe => recipe !== null);
    },

    /**
     * Filter recipes by search criteria
     * @param {Array} recipes - Array of recipes
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered recipes
     */
    filterRecipes(recipes, filters) {
        return recipes.filter(recipe => {
            // Filter by category
            if (filters.category && recipe.category !== filters.category) {
                return false;
            }
            
            // Filter by area
            if (filters.area && recipe.area !== filters.area) {
                return false;
            }
            
            // Filter by search term
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                const matchesName = recipe.name.toLowerCase().includes(term);
                const matchesIngredients = recipe.ingredients.some(
                    ing => ing.name.toLowerCase().includes(term)
                );
                if (!matchesName && !matchesIngredients) {
                    return false;
                }
            }
            
            return true;
        });
    }
};