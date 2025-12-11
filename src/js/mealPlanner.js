/**
 * Meal Planner Page Module
 * Handles meal planning and shopping list functionality
 */

import { StorageManager } from './storageManager.js';
import { APIHandler } from './apiHandler.js';
import { RecipeService } from './recipeService.js';
import { UIManager } from './uiManager.js';
import { Utils } from './utils.js';

class MealPlannerApp {
    constructor() {
        this.mealPlan = {};
        this.allRecipes = {};
    }

    /**
     * Initialize the meal planner
     */
    async init() {
        this.mealPlan = StorageManager.getMealPlan();
        this.setupEventListeners();
        await this.loadMealPlan();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const generateBtn = document.getElementById('generateShoppingListBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateShoppingList();
            });
        }
    }

    /**
     * Load and display meal plan
     */
    async loadMealPlan() {
        UIManager.showLoading();

        try {
            // Get all recipe IDs from meal plan
            const recipeIds = new Set();
            Object.keys(this.mealPlan).forEach(day => {
                Object.keys(this.mealPlan[day]).forEach(mealType => {
                    const recipeId = this.mealPlan[day][mealType];
                    if (recipeId) {
                        recipeIds.add(recipeId);
                    }
                });
            });

            // Fetch recipes that aren't already loaded
            const fetchPromises = [];
            recipeIds.forEach(id => {
                fetchPromises.push(
                    APIHandler.getRecipeById(id).then(meal => {
                        const recipe = RecipeService.processRecipe(meal);
                        if (recipe) {
                            this.allRecipes[recipe.id] = recipe;
                        }
                    })
                );
            });

            await Promise.all(fetchPromises);

            // Render meal plan
            this.renderMealPlan();
        } catch (error) {
            console.error('Error loading meal plan:', error);
            UIManager.showNotification('Error loading meal plan. Please try again.');
        } finally {
            UIManager.hideLoading();
        }
    }

    /**
     * Render the meal plan grid
     */
    renderMealPlan() {
        const container = document.getElementById('mealGrid');
        if (!container) return;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const mealTypeNames = ['🍳 Breakfast', '🥗 Lunch', '🍽️ Dinner'];

        container.innerHTML = days.map((day, index) => `
            <div class="day-card">
                <h3>${dayNames[index]}</h3>
                ${mealTypes.map((type, typeIndex) => {
                    const recipeId = this.mealPlan[day][type];
                    const recipe = recipeId ? this.allRecipes[recipeId] : null;
                    
                    return `
                        <div class="meal-slot">
                            <h4>${mealTypeNames[typeIndex]}</h4>
                            ${recipe ? `
                                <div class="meal-item">
                                    <div class="meal-item-content">
                                        <div class="meal-item-name">${recipe.name}</div>
                                    </div>
                                    <button class="remove-meal-btn" data-day="${day}" data-type="${type}">
                                        Remove
                                    </button>
                                </div>
                            ` : `
                                <div class="empty-slot">No meal planned</div>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');

        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.getAttribute('data-day');
                const type = e.target.getAttribute('data-type');
                this.removeMealFromPlan(day, type);
            });
        });
    }

    /**
     * Remove a meal from the plan
     * @param {string} day - Day of the week
     * @param {string} mealType - Type of meal
     */
    removeMealFromPlan(day, mealType) {
        this.mealPlan[day][mealType] = null;
        StorageManager.saveMealPlan(this.mealPlan);
        this.renderMealPlan();
        UIManager.showNotification('Meal removed from plan');
        
        // Hide shopping list if visible
        const shoppingList = document.getElementById('shoppingList');
        if (shoppingList) {
            shoppingList.style.display = 'none';
        }
    }

    /**
     * Generate and display shopping list
     */
    generateShoppingList() {
        const container = document.getElementById('shoppingList');
        if (!container) return;

        const ingredients = {};

        // Collect all ingredients from planned meals
        Object.keys(this.mealPlan).forEach(day => {
            Object.keys(this.mealPlan[day]).forEach(mealType => {
                const recipeId = this.mealPlan[day][mealType];
                if (recipeId) {
                    const recipe = this.allRecipes[recipeId];
                    if (recipe && recipe.ingredients) {
                        recipe.ingredients.forEach(ing => {
                            const key = ing.name.toLowerCase();
                            if (!ingredients[key]) {
                                ingredients[key] = {
                                    name: ing.name,
                                    measures: []
                                };
                            }
                            if (ing.measure) {
                                ingredients[key].measures.push(ing.measure);
                            }
                        });
                    }
                }
            });
        });

        // Check if there are any ingredients
        if (Object.keys(ingredients).length === 0) {
            UIManager.showNotification('Add meals to your plan first!');
            return;
        }

        // Categorize ingredients
        const categories = this.categorizeIngredients(ingredients);

        // Render shopping list
        let html = '<h3>Shopping List</h3>';

        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                html += `
                    <div class="ingredient-category">
                        <h4>${category}</h4>
                        <ul class="ingredient-list">
                            ${items.map((item, index) => `
                                <li class="ingredient-item">
                                    <input type="checkbox" id="ing-${category}-${index}">
                                    <label for="ing-${category}-${index}">
                                        ${item.name} ${item.measures.length > 0 ? `(${item.measures.join(', ')})` : ''}
                                    </label>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        container.style.display = 'block';

        // Add checkbox event listeners
        container.querySelectorAll('.ingredient-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.target.closest('.ingredient-item').classList.toggle('checked', e.target.checked);
            });
        });

        // Scroll to shopping list
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Categorize ingredients into groups
     * @param {Object} ingredients - Ingredients object
     * @returns {Object} Categorized ingredients
     */
    categorizeIngredients(ingredients) {
        const categoryKeywords = {
            'Produce': ['tomato', 'onion', 'garlic', 'potato', 'carrot', 'lettuce', 'spinach', 'pepper', 'cucumber', 'mushroom', 'apple', 'banana', 'lemon', 'lime', 'orange', 'avocado', 'broccoli', 'cauliflower', 'celery', 'corn', 'peas', 'beans', 'cabbage', 'zucchini'],
            'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'duck', 'prawn', 'crab', 'lobster'],
            'Dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'parmesan', 'mozzarella', 'cheddar'],
            'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'rice', 'pasta', 'bread', 'sauce', 'stock', 'vinegar', 'honey', 'soy'],
            'Spices & Herbs': ['basil', 'oregano', 'thyme', 'cumin', 'paprika', 'cinnamon', 'ginger', 'parsley', 'rosemary', 'bay', 'chili', 'curry', 'turmeric', 'coriander']
        };

        const categorized = {
            'Produce': [],
            'Meat & Seafood': [],
            'Dairy': [],
            'Pantry': [],
            'Spices & Herbs': [],
            'Other': []
        };

        Object.values(ingredients).forEach(ing => {
            let categorized_flag = false;
            const ingNameLower = ing.name.toLowerCase();

            for (let [category, keywords] of Object.entries(categoryKeywords)) {
                if (keywords.some(keyword => ingNameLower.includes(keyword))) {
                    categorized[category].push(ing);
                    categorized_flag = true;
                    break;
                }
            }

            if (!categorized_flag) {
                categorized['Other'].push(ing);
            }
        });

        return categorized;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MealPlannerApp();
    app.init();
});