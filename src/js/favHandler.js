import { StorageManager } from './storageManager.js';
import { APIHandler } from './apiHandler.js';
import { RecipeService } from './recipeService.js';
import { UIManager } from './uiManager.js';

// Favorites Page Logic
class FavoritesApp {
    constructor() {
        this.favorites = [];
        this.allRecipes = {};
        this.currentRecipe = null;
    }

    async init() {
        this.favorites = StorageManager.getFavorites();
        this.setupEventListeners();
        await this.loadFavorites();
    }

    setupEventListeners() {
        // Meal plan modal
        const confirmBtn = document.getElementById('confirmAddMealBtn');
        const cancelBtn = document.getElementById('cancelMealBtn');
        const generateBtn = document.getElementById('generateShoppingListBtn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.addToMealPlan());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeMealPlanModal());
        }
    }

    async loadFavorites() {
        UIManager.showLoading();

        if (this.favorites.length === 0) {
            document.getElementById('favoritesGrid').innerHTML = `
                        <div class="empty-state">
                            <h3>No favorites yet</h3>
                            <p>Start adding recipes to your favorites from the home page!</p>
                            <a href="index.html" class="btn" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Browse Recipes</a>
                        </div>
                    `;
            UIManager.hideLoading();
            return;
        }

        const fetchPromises = this.favorites.map(async (id) => {
            const meal = await APIHandler.getRecipeById(id);
            const recipe = RecipeService.processRecipe(meal);
            if (recipe) {
                this.allRecipes[recipe.id] = recipe;
            }
            return recipe;
        });

        const recipes = (await Promise.all(fetchPromises)).filter(r => r);
        this.renderRecipes(recipes);

        UIManager.hideLoading();
    }

    renderRecipes(recipes) {
        const container = document.getElementById('favoritesGrid');

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

        container.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.getAttribute('data-id');
                this.showRecipeDetail(recipeId);
            });
        });
    }

    async showRecipeDetail(recipeId) {
        UIManager.showLoading();

        let recipe = this.allRecipes[recipeId];

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

            document.querySelector('.favorites-view').style.display = 'none';
            document.getElementById('recipeDetail').classList.add('active');
            window.scrollTo(0, 0);
        }

        UIManager.hideLoading();
    }

    renderRecipeDetail(recipe) {
        const isFavorite = this.favorites.includes(recipe.id);
        const container = document.getElementById('recipeDetail');

        container.innerHTML = `
                    <div class="detail-header">
                        <button class="btn back-btn" id="backBtn">← Back to Favorites</button>
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

        document.getElementById('backBtn').addEventListener('click', () => {
            document.querySelector('.favorites-view').style.display = 'block';
            document.getElementById('recipeDetail').classList.remove('active');
            window.scrollTo(0, 0);
        });

        document.getElementById('favoriteBtn').addEventListener('click', () => {
            this.toggleFavorite(recipe.id);
        });

        document.getElementById('addToMealPlanBtn').addEventListener('click', () => {
            this.openMealPlanModal(recipe.id);
        });
    }

    toggleFavorite(recipeId) {
        const index = this.favorites.indexOf(recipeId);

        if (index > -1) {
            this.favorites.splice(index, 1);
            UIManager.showNotification('Removed from favorites');

            // Refresh the favorites list
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            this.favorites.push(recipeId);
            UIManager.showNotification('Added to favorites!');
        }

        StorageManager.saveFavorites(this.favorites);

        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            const isFavorite = this.favorites.includes(recipeId);
            favoriteBtn.textContent = isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites';
            favoriteBtn.classList.toggle('favorited', isFavorite);
        }
    }

    openMealPlanModal() {
        document.getElementById('mealPlanModal').classList.add('active');
    }

    closeMealPlanModal() {
        document.getElementById('mealPlanModal').classList.remove('active');
    }

    addToMealPlan() {
        const day = document.getElementById('daySelect').value;
        const mealType = document.getElementById('mealTypeSelect').value;
        const recipeId = this.currentRecipe.id;

        const mealPlan = StorageManager.getMealPlan();
        mealPlan[day][mealType] = recipeId;
        StorageManager.saveMealPlan(mealPlan);

        UIManager.showNotification(`Added to ${day} ${mealType}!`);
        this.closeMealPlanModal();
    }
}

// Initialize the app
const app = new FavoritesApp();
app.init();