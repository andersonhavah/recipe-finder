// ============= STORAGE MANAGER MODULE =============
const StorageManager = {
    // Save favorites to localStorage
    saveFavorites(favorites) {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    },

    // Get favorites from localStorage
    getFavorites() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    },

    // Save meal plan to localStorage
    saveMealPlan(mealPlan) {
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    },

    // Get meal plan from localStorage
    getMealPlan() {
        const mealPlan = localStorage.getItem('mealPlan');
        return mealPlan ? JSON.parse(mealPlan) : this.getEmptyMealPlan();
    },

    // Save user preferences
    savePreferences(preferences) {
        localStorage.setItem('preferences', JSON.stringify(preferences));
    },

    // Get user preferences
    getPreferences() {
        const preferences = localStorage.getItem('preferences');
        return preferences ? JSON.parse(preferences) : { lastCategory: '', lastArea: '' };
    },

    // Get empty meal plan structure
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

// ============= API HANDLER MODULE =============
const APIHandler = {
    baseURL: 'https://www.themealdb.com/api/json/v1/1',

    // Search recipes by name
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

    // Get recipe by ID
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

    // Get random recipe
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

    // Filter by category
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

    // Filter by area (cuisine)
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

    // List all categories
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

    // List all areas
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

// ============= RECIPE SERVICE MODULE =============
const RecipeService = {
    // Parse ingredients from API response
    parseIngredients(meal) {
        const ingredients = [];
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

    // Process recipe data
    processRecipe(meal) {
        if (!meal) return null;

        return {
            id: meal.idMeal,
            name: meal.strMeal,
            image: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
            ingredients: this.parseIngredients(meal),
            tags: meal.strTags ? meal.strTags.split(',') : [],
            youtube: meal.strYoutube
        };
    },

    // Process multiple recipes
    processRecipes(meals) {
        return meals.map(meal => this.processRecipe(meal));
    }
};

// ============= UI MANAGER MODULE =============
const UIManager = {
    // Show loading spinner
    showLoading() {
        document.getElementById('loading').classList.add('active');
    },

    // Hide loading spinner
    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    },

    // Show notification
    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('active');
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    },

    // Render recipe cards
    renderRecipes(recipes, containerId) {
        const container = document.getElementById(containerId);

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

        // Add click event listeners
        container.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.getAttribute('data-id');
                App.showRecipeDetail(recipeId);
            });
        });
    },

    // Render recipe detail
    renderRecipeDetail(recipe) {
        const isFavorite = App.favorites.includes(recipe.id);
        const container = document.getElementById('recipeDetail');

        container.innerHTML = `
                    <div class="detail-header">
                        <button class="btn back-btn" id="backBtn">← Back</button>
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
            App.showView('home');
        });

        document.getElementById('favoriteBtn').addEventListener('click', () => {
            App.toggleFavorite(recipe.id);
        });

        document.getElementById('addToMealPlanBtn').addEventListener('click', () => {
            App.openMealPlanModal(recipe.id);
        });
    },

    // Render meal plan
    renderMealPlan(mealPlan, recipes) {
        const container = document.getElementById('mealGrid');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const mealTypeNames = ['🍳 Breakfast', '🥗 Lunch', '🍽️ Dinner'];

        container.innerHTML = days.map((day, index) => `
                    <div class="day-card">
                        <h3>${dayNames[index]}</h3>
                        ${mealTypes.map((type, typeIndex) => {
            const recipeId = mealPlan[day][type];
            const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;

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
            btn.addEventListener('click', () => {
                const day = btn.getAttribute('data-day');
                const type = btn.getAttribute('data-type');
                App.removeMealFromPlan(day, type);
            });
        });
    },

    // Render shopping list
    renderShoppingList(mealPlan, recipes) {
        const container = document.getElementById('shoppingList');
        const ingredients = {};

        // Collect all ingredients
        Object.keys(mealPlan).forEach(day => {
            Object.keys(mealPlan[day]).forEach(mealType => {
                const recipeId = mealPlan[day][mealType];
                if (recipeId) {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (recipe) {
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

        // Categorize ingredients (simplified categorization)
        const categories = {
            'Produce': ['tomato', 'onion', 'garlic', 'potato', 'carrot', 'lettuce', 'spinach', 'pepper', 'cucumber', 'mushroom', 'apple', 'banana', 'lemon', 'lime'],
            'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey', 'lamb'],
            'Dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg'],
            'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'rice', 'pasta', 'bread'],
            'Spices & Herbs': ['basil', 'oregano', 'thyme', 'cumin', 'paprika', 'cinnamon', 'ginger']
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
            for (let [category, keywords] of Object.entries(categories)) {
                if (keywords.some(keyword => ing.name.toLowerCase().includes(keyword))) {
                    categorized[category].push(ing);
                    categorized_flag = true;
                    break;
                }
            }
            if (!categorized_flag) {
                categorized['Other'].push(ing);
            }
        });

        let html = '<h3>Shopping List</h3>';

        Object.entries(categorized).forEach(([category, items]) => {
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
    },

    // Populate filter dropdowns
    populateFilters(categories, areas) {
        const categorySelect = document.getElementById('categoryFilter');
        const areaSelect = document.getElementById('areaFilter');

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.strCategory;
            option.textContent = cat.strCategory;
            categorySelect.appendChild(option);
        });

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.strArea;
            option.textContent = area.strArea;
            areaSelect.appendChild(option);
        });
    }
};

// ============= MAIN APP MODULE =============
const App = {
    currentRecipe: null,
    favorites: [],
    mealPlan: {},
    allRecipes: {},

    async init() {
        // Load data from localStorage
        this.favorites = StorageManager.getFavorites();
        this.mealPlan = StorageManager.getMealPlan();

        // Initialize filters
        const categories = await APIHandler.listCategories();
        const areas = await APIHandler.listAreas();
        UIManager.populateFilters(categories, areas);

        // Set up event listeners
        this.setupEventListeners();

        // Load initial recipes
        this.searchRecipes('chicken');
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.showView(view);
            });
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => {
            const query = document.getElementById('searchInput').value;
            this.searchRecipes(query);
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                this.searchRecipes(query);
            }
        });

        // Random recipe
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.getRandomRecipe();
        });

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterRecipes();
        });

        document.getElementById('areaFilter').addEventListener('change', (e) => {
            this.filterRecipes();
        });

        // Meal plan modal
        document.getElementById('confirmAddMealBtn').addEventListener('click', () => {
            this.addToMealPlan();
        });

        document.getElementById('cancelMealBtn').addEventListener('click', () => {
            this.closeMealPlanModal();
        });

        // Shopping list
        document.getElementById('generateShoppingListBtn').addEventListener('click', () => {
            this.generateShoppingList();
        });
    },

    async searchRecipes(query) {
        UIManager.showLoading();
        const meals = await APIHandler.searchRecipes(query);
        const recipes = RecipeService.processRecipes(meals);

        // Store recipes for later use
        recipes.forEach(recipe => {
            this.allRecipes[recipe.id] = recipe;
        });

        UIManager.renderRecipes(recipes, 'recipesGrid');
        UIManager.hideLoading();
    },

    async filterRecipes() {
        const category = document.getElementById('categoryFilter').value;
        const area = document.getElementById('areaFilter').value;

        UIManager.showLoading();

        let meals = [];
        if (category && area) {
            // Get by category first, then filter by area
            const categoryMeals = await APIHandler.filterByCategory(category);
            // Fetch full details to check area
            const detailedMeals = await Promise.all(
                categoryMeals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
            );
            meals = detailedMeals.filter(meal => meal && meal.strArea === area);
        } else if (category) {
            meals = await APIHandler.filterByCategory(category);
            // Fetch full details for simplified meals
            meals = await Promise.all(
                meals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
            );
        } else if (area) {
            meals = await APIHandler.filterByArea(area);
            // Fetch full details for simplified meals
            meals = await Promise.all(
                meals.slice(0, 20).map(meal => APIHandler.getRecipeById(meal.idMeal))
            );
        } else {
            // Show all (default search)
            meals = await APIHandler.searchRecipes('');
        }

        const recipes = RecipeService.processRecipes(meals.filter(m => m));

        // Store recipes
        recipes.forEach(recipe => {
            this.allRecipes[recipe.id] = recipe;
        });

        UIManager.renderRecipes(recipes, 'recipesGrid');
        UIManager.hideLoading();
    },

    async getRandomRecipe() {
        UIManager.showLoading();
        const meal = await APIHandler.getRandomRecipe();
        const recipe = RecipeService.processRecipe(meal);

        if (recipe) {
            this.allRecipes[recipe.id] = recipe;
            this.showRecipeDetail(recipe.id);
        }

        UIManager.hideLoading();
    },

    async showRecipeDetail(recipeId) {
        UIManager.showLoading();

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
            UIManager.renderRecipeDetail(recipe);

            // Switch to detail view
            document.getElementById('homeView').classList.remove('active');
            document.getElementById('recipeDetail').classList.add('active');
            document.getElementById('mealPlannerView').classList.remove('active');
            document.getElementById('favoritesView').classList.remove('active');

            // Scroll to top
            window.scrollTo(0, 0);
        }

        UIManager.hideLoading();
    },

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
    },

    openMealPlanModal(recipeId) {
        this.currentRecipe = this.allRecipes[recipeId];
        document.getElementById('mealPlanModal').classList.add('active');
    },

    closeMealPlanModal() {
        document.getElementById('mealPlanModal').classList.remove('active');
    },

    addToMealPlan() {
        const day = document.getElementById('daySelect').value;
        const mealType = document.getElementById('mealTypeSelect').value;
        const recipeId = this.currentRecipe.id;

        this.mealPlan[day][mealType] = recipeId;
        StorageManager.saveMealPlan(this.mealPlan);

        UIManager.showNotification(`Added to ${day} ${mealType}!`);
        this.closeMealPlanModal();
    },

    removeMealFromPlan(day, mealType) {
        this.mealPlan[day][mealType] = null;
        StorageManager.saveMealPlan(this.mealPlan);
        this.loadMealPlan();
        UIManager.showNotification('Meal removed from plan');
    },

    async loadMealPlan() {
        UIManager.showLoading();

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
            if (!this.allRecipes[id]) {
                fetchPromises.push(
                    APIHandler.getRecipeById(id).then(meal => {
                        const recipe = RecipeService.processRecipe(meal);
                        if (recipe) {
                            this.allRecipes[recipe.id] = recipe;
                        }
                    })
                );
            }
        });

        await Promise.all(fetchPromises);

        // Render meal plan
        const recipes = Object.values(this.allRecipes);
        UIManager.renderMealPlan(this.mealPlan, recipes);

        UIManager.hideLoading();
    },

    generateShoppingList() {
        const recipes = Object.values(this.allRecipes);
        UIManager.renderShoppingList(this.mealPlan, recipes);
    },

    async loadFavorites() {
        UIManager.showLoading();

        // Fetch favorite recipes
        const fetchPromises = this.favorites.map(async (id) => {
            if (!this.allRecipes[id]) {
                const meal = await APIHandler.getRecipeById(id);
                const recipe = RecipeService.processRecipe(meal);
                if (recipe) {
                    this.allRecipes[recipe.id] = recipe;
                }
                return recipe;
            }
            return this.allRecipes[id];
        });

        const recipes = (await Promise.all(fetchPromises)).filter(r => r);
        UIManager.renderRecipes(recipes, 'favoritesGrid');

        UIManager.hideLoading();
    },

    showView(viewName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
        });

        // Hide all views
        document.getElementById('homeView').classList.remove('active');
        document.getElementById('recipeDetail').classList.remove('active');
        document.getElementById('mealPlannerView').classList.remove('active');
        document.getElementById('favoritesView').classList.remove('active');

        // Show selected view
        switch (viewName) {
            case 'home':
                document.getElementById('homeView').classList.add('active');
                break;
            case 'meal-planner':
                document.getElementById('mealPlannerView').classList.add('active');
                this.loadMealPlan();
                break;
            case 'favorites':
                document.getElementById('favoritesView').classList.add('active');
                this.loadFavorites();
                break;
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});