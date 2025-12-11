/**
 * Main Application Module for Home Page
 * Coordinates all other modules and handles app logic
 */

import { StorageManager } from './storageManager.js';
import { APIHandler } from './apiHandler.js';
import { RecipeService } from './recipeService.js';
import { UIManager } from './uiManager.js';
import { Utils } from './utils.js';

class RecipeApp {
    constructor() {
        this.currentRecipe = null;
        this.favorites = [];
        this.allRecipes = {};
        this.currentView = 'grid'; // 'grid' or 'detail'
    }

    /**
     * Initialize the application
     */
    async init() {
        // Load data from localStorage
        this.favorites = StorageManager.getFavorites();

        // Initialize filters
        await this.initializeFilters();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial recipes
        await this.searchRecipes('chicken');
    }

    /**
     * Initialize filter dropdowns
     */
    async initializeFilters() {
        try {
            const categories = await APIHandler.listCategories();
            const areas = await APIHandler.listAreas();
            UIManager.populateFilters(categories, areas);
        } catch (error) {
            console.error('Error initializing filters:', error);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = document.getElementById('searchInput').value;
                this.searchRecipes(query);
            });
        }

        // Search input (Enter key)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchRecipes(e.target.value);
                }
            });
        }

        // Random recipe button
        const randomBtn = document.getElementById('randomBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.getRandomRecipe();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterRecipes();
            });
        }

        // Area filter
        const areaFilter = document.getElementById('areaFilter');
        if (areaFilter) {
            areaFilter.addEventListener('change', () => {
                this.filterRecipes();
            });
        }

        // Meal plan modal buttons
        const confirmBtn = document.getElementById('confirmAddMealBtn');
        const cancelBtn = document.getElementById('cancelMealBtn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.addToMealPlan();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeMealPlanModal();
            });
        }
    }

    /**
     * Search recipes by query
     * @param {string} query - Search query
     */
    async searchRecipes(query) {
        UIManager.showLoading();

        try {
            const meals = await APIHandler.searchRecipes(query);
            const recipes = RecipeService.processRecipes(meals);

            // Store recipes for later use
            recipes.forEach(recipe => {
                this.allRecipes[recipe.id] = recipe;
            });

            this.renderRecipes(recipes);
        } catch (error) {
            console.error('Error searching recipes:', error);
            UIManager.showNotification('Error loading recipes. Please try again.');
        } finally {
            UIManager.hideLoading();
        }
    }

    /**
     * Filter recipes based on selected filters
     */
    async filterRecipes() {
        const category = document.getElementById('categoryFilter').value;
        const area = document.getElementById('areaFilter').value;

        UIManager.showLoading();

        try {
            let meals = [];

            if (category && area) {
                // Get by category first, then filter by area
                const categoryMeals = await APIHandler.filterByCategory(category);
                const detailedMeals = await Promise.all(
                    categoryMeals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
                );
                meals = detailedMeals.filter(meal => meal && meal.strArea === area);
            } else if (category) {
                meals = await APIHandler.filterByCategory(category);
                meals = await Promise.all(
                    meals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
                );
            } else if (area) {
                meals = await APIHandler.filterByArea(area);
                meals = await Promise.all(
                    meals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
                );
            } else {
                // Show default results
                meals = await APIHandler.searchRecipes('');
            }

            const recipes = RecipeService.processRecipes(meals.filter(m => m));

            // Store recipes
            recipes.forEach(recipe => {
                this.allRecipes[recipe.id] = recipe;
            });

            this.renderRecipes(recipes);
        } catch (error) {
            console.error('Error filtering recipes:', error);
            UIManager.showNotification('Error filtering recipes. Please try again.');
        } finally {
            UIManager.hideLoading();
        }
    }

    /**
     * Get a random recipe
     */
    async getRandomRecipe() {
        UIManager.showLoading();

        try {
            const meal = await APIHandler.getRandomRecipe();
            const recipe = RecipeService.processRecipe(meal);

            if (recipe) {
                this.allRecipes[recipe.id] = recipe;
                this.showRecipeDetail(recipe.id);
            }
        } catch (error) {
            console.error('Error getting random recipe:', error);
            UIManager.showNotification('Error loading recipe. Please try again.');
        } finally {
            UIManager.hideLoading();
        }
    }

    /**
     * Render recipes to the grid
     * @param {Array} recipes - Array of recipe objects
     */
    renderRecipes(recipes) {
        const container = document.getElementById('recipesGrid');

        if (!container) return;

        if (!recipes || recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No recipes found</h3>
                    <p>Try a different search or filter</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}">
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <div class="recipe-tags">
                        <span class="tag category">${recipe.category}</span>
                        <span class="tag">${recipe.area}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to cards
        container.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.getAttribute('data-id');
                this.showRecipeDetail(recipeId);
            });
        });
    }

    /**
     * Show recipe detail view
     * @param {string} recipeId - Recipe ID
     */
    async showRecipeDetail(recipeId) {
        UIManager.showLoading();

        try {
            // Check if recipe is already loaded
            let recipe = this.allRecipes[recipeId];

            // If not, fetch it
            if (!recipe) {
                const meal = await APIHandler.getRecipeById(recipeId);
                recipe = RecipeService.processRecipe(meal);
                if (recipe) {
                    this.allRecipes[recipe.id] = recipe;
                }
            }

            if (recipe) {
                this.currentRecipe = recipe;
                this.renderRecipeDetail(recipe);

                // Hide grid, show detail
                const gridContainer = document.querySelector('.search-section');
                const recipesGrid = document.getElementById('recipesGrid');
                const detailView = document.getElementById('recipeDetail');

                if (gridContainer) gridContainer.style.display = 'none';
                if (recipesGrid) recipesGrid.style.display = 'none';
                if (detailView) detailView.classList.add('active');

                Utils.scrollToTop();
            }
        } catch (error) {
            console.error('Error showing recipe detail:', error);
            UIManager.showNotification('Error loading recipe details. Please try again.');
        } finally {
            UIManager.hideLoading();
        }
    }

    /**
     * Render recipe detail view
     * @param {Object} recipe - Recipe object
     */
    renderRecipeDetail(recipe) {
        const isFavorite = this.favorites.includes(recipe.id);
        const container = document.getElementById('recipeDetail');

        if (!container) return;

        container.innerHTML = `
            <div class="detail-header">
                <button class="btn back-btn" id="backBtn">← Back to Results</button>
                <div class="action-buttons">
                    <button class="btn favorite-btn ${isFavorite ? 'favorited' : ''}" id="favoriteBtn">
                        ${isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
                    </button>
                    <button class="btn" id="addToMealPlanBtn">📅 Add to Meal Plan</button>
                </div>
            </div>
            <div class="detail-content">
                <img src="${recipe.image}" alt="${recipe.name}" class="detail-image">
                <div class="detail-body">
                    <h2 class="detail-title">${recipe.name}</h2>
                    <div class="detail-meta">
                        <div class="meta-item">
                            <span>📂</span>
                            <span>${recipe.category}</span>
                        </div>
                        <div class="meta-item">
                            <span>🌍</span>
                            <span>${recipe.area} Cuisine</span>
                        </div>
                        ${recipe.tags.length > 0 ? `
                            <div class="meta-item">
                                <span>🏷️</span>
                                <span>${recipe.tags.join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h3>Ingredients</h3>
                        <ul class="ingredients-list">
                            ${recipe.ingredients.map(ing => `
                                <li>${ing.measure} ${ing.name}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Instructions</h3>
                        <p class="instructions">${recipe.instructions}</p>
                    </div>
                    
                    ${recipe.youtube ? `
                        <div class="detail-section">
                            <h3>Video Tutorial</h3>
                            <a href="${recipe.youtube}" target="_blank" class="btn btn-secondary">
                                Watch on YouTube
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showGridView();
        });

        document.getElementById('favoriteBtn').addEventListener('click', () => {
            this.toggleFavorite(recipe.id);
        });

        document.getElementById('addToMealPlanBtn').addEventListener('click', () => {
            this.openMealPlanModal();
        });
    }

    /**
     * Show grid view (hide detail)
     */
    showGridView() {
        const gridContainer = document.querySelector('.search-section');
        const recipesGrid = document.getElementById('recipesGrid');
        const detailView = document.getElementById('recipeDetail');

        if (gridContainer) gridContainer.style.display = 'block';
        if (recipesGrid) recipesGrid.style.display = 'grid';
        if (detailView) detailView.classList.remove('active');

        Utils.scrollToTop();
    }

    /**
     * Toggle favorite status of a recipe
     * @param {string} recipeId - Recipe ID
     */
    toggleFavorite(recipeId) {
        const index = this.favorites.indexOf(recipeId);

        if (index > -1) {
            // Remove from favorites
            this.favorites.splice(index, 1);
            UIManager.showNotification('Removed from favorites');
        } else {
            // Add to favorites
            this.favorites.push(recipeId);
            UIManager.showNotification('Added to favorites!');
        }

        // Save to localStorage
        StorageManager.saveFavorites(this.favorites);

        // Update UI
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            const isFavorite = this.favorites.includes(recipeId);
            favoriteBtn.textContent = isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites';
            favoriteBtn.classList.toggle('favorited', isFavorite);
        }
    }

    /**
     * Open meal plan modal
     */
    openMealPlanModal() {
        const modal = document.getElementById('mealPlanModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Close meal plan modal
     */
    closeMealPlanModal() {
        const modal = document.getElementById('mealPlanModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Add current recipe to meal plan
     */
    addToMealPlan() {
        if (!this.currentRecipe) return;

        const day = document.getElementById('daySelect').value;
        const mealType = document.getElementById('mealTypeSelect').value;
        const recipeId = this.currentRecipe.id;

        const mealPlan = StorageManager.getMealPlan();
        mealPlan[day][mealType] = recipeId;
        StorageManager.saveMealPlan(mealPlan);

        UIManager.showNotification(`Added to ${Utils.capitalize(day)} ${mealType}!`);
        this.closeMealPlanModal();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RecipeApp();
    app.init();
});