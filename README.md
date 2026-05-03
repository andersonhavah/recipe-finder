# Recipe Finder & Meal Planner

A responsive, modern web application for discovering recipes, managing favorites, and planning weekly meals with integrated shopping list generation. Built with vanilla JavaScript, HTML5, and CSS3, this application leverages the TheMealDB API to provide a rich recipe database with filtering, search, and meal planning capabilities.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
  - [Home Page](#home-page)
  - [Favorites](#favorites)
  - [Meal Planner](#meal-planner)
- [Project Structure](#project-structure)
- [Module Documentation](#module-documentation)
- [API Integration](#api-integration)
- [Data Persistence](#data-persistence)
- [Development Guidelines](#development-guidelines)
- [Browser Support](#browser-support)
- [Future Enhancements](#future-enhancements)

---

## Features

### Core Functionality

- **Recipe Discovery**
  - Keyword-based search across TheMealDB's extensive recipe database
  - Browse recipes by category (Seafood, Vegetarian, Pasta, etc.)
  - Filter by cuisine type (Italian, Indian, Chinese, Mexican, etc.)
  - Random recipe suggestion with "Surprise Me!" feature

- **Recipe Details**
  - Comprehensive ingredient lists with measurements
  - Step-by-step cooking instructions
  - Recipe metadata (category, cuisine, tags)
  - YouTube video links for visual cooking guides
  - High-quality recipe images

- **Favorites Management**
  - Save favorite recipes for quick access
  - Persistent storage using browser's localStorage
  - Dedicated Favorites page displaying all saved recipes
  - Remove favorites functionality

- **Weekly Meal Planning**
  - Plan meals for all seven days of the week
  - Three meal slots per day (Breakfast, Lunch, Dinner)
  - Add recipes from the home page or favorites directly to meal plan
  - Remove meals from the plan as needed
  - Persistent meal plan storage

- **Shopping List Generation**
  - Automatically aggregate ingredients from planned meals
  - Organized shopping list with smart ingredient categorization:
    - Produce
    - Meat & Seafood
    - Dairy
    - Pantry
    - Spices & Herbs
    - Other
  - Interactive checkbox system to track purchased items
  - Consolidates duplicate ingredients with combined measurements

- **User Experience**
  - Responsive design for desktop, tablet, and mobile devices
  - Loading indicators during API calls
  - Real-time notifications for user actions
  - Smooth navigation between views
  - Modern, intuitive UI with intuitive flow

---

## Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Advanced styling with:
  - CSS Grid for responsive layouts
  - CSS Flexbox for component alignment
  - CSS Variables for theming
  - CSS Transitions for smooth animations
  - Media queries for responsive design
- **JavaScript (ES6+)** - Core application logic with:
  - ES6 Modules for code organization
  - Async/Await for asynchronous operations
  - Template literals for dynamic content
  - Destructuring and modern syntax

### External Services
- **TheMealDB API** - Free recipe database providing:
  - Recipe search by name
  - Category and cuisine filtering
  - Recipe details with ingredients and instructions
  - Random recipe selection

### Storage
- **Browser localStorage API** - Client-side data persistence for:
  - Favorite recipes
  - Meal plans
  - User preferences

---

## Architecture

The application follows a **modular architecture** with separation of concerns:

```
┌─────────────────────────────────────────┐
│           UI Layer (HTML)               │
├─────────────────────────────────────────┤
│      Application Layer (app.js,         │
│      favHandler.js, mealPlanner.js)    │
├─────────────────────────────────────────┤
│        Service Layer                    │
│  ┌─────────────────────────────────┐   │
│  │  UIManager  │  StorageManager   │   │
│  │  RecipeService │ Utils          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│      API Layer (APIHandler)             │
├─────────────────────────────────────────┤
│   External Services (TheMealDB API)     │
└─────────────────────────────────────────┘
```

### Key Design Principles

1. **Modularity** - Each module has a single, well-defined responsibility
2. **Reusability** - Shared utilities and services across pages
3. **Separation of Concerns** - Distinct layers for API, data, UI, and business logic
4. **Event-Driven** - Responsive to user interactions and state changes
5. **Async-First** - Proper handling of asynchronous API calls

---

## Getting Started

### Prerequisites

- **Web Browser** - Modern browser with ES6 module support:
  - Chrome 61+
  - Firefox 67+
  - Safari 11+
  - Edge 79+
- **Internet Connection** - Required for TheMealDB API access
- **Static Server** - For development/testing (required due to CORS and module loading)

### Installation

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd recipe-finder
   ```

2. **Verify File Structure**
   Ensure all files are present:
   ```
   recipe-finder/
   ├── index.html
   ├── favorites.html
   ├── meal-planner.html
   ├── src/
   │   ├── css/
   │   │   └── styles.css
   │   └── js/
   │       ├── app.js
   │       ├── favHandler.js
   │       ├── mealPlanner.js
   │       ├── apiHandler.js
   │       ├── recipeService.js
   │       ├── storageManager.js
   │       ├── uiManager.js
   │       └── utils.js
   └── README.md
   ```

### Running the Application

The application requires a local server due to ES6 module requirements. Choose one of the following options:

#### Option 1: Using Python (Recommended)

**Python 3.x:**
```bash
python -m http.server 8000
```

**Python 2.x:**
```bash
python -m SimpleHTTPServer 8000
```

#### Option 2: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Option 3: Using Live Server (VS Code Extension)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 4: Using PHP

```bash
php -S localhost:8000
```

**Access the Application**
Open your browser and navigate to:
```
http://localhost:8000
```

---

## Usage

### Home Page (`index.html`)

The main page for discovering recipes.

**Features:**
- **Search Bar** - Enter recipe name (e.g., "chicken", "pasta", "curry")
- **Random Button** - Get a random recipe suggestion
- **Category Filter** - Browse recipes by category
- **Cuisine Filter** - Filter by cuisine type
- **Recipe Grid** - Browse search results
- **Recipe Cards** - Click to view full details

**Workflow:**
1. Search for a recipe or use filters
2. Browse results in the grid
3. Click a recipe card to view details
4. Add to favorites or meal plan from the detail view

### Favorites Page (`favorites.html`)

Manage your saved recipes.

**Features:**
- View all saved favorite recipes
- Quick access to frequently cooked recipes
- Add recipes to meal plan directly from favorites
- Remove recipes from favorites

**Workflow:**
1. Navigate to the Favorites page
2. View all saved recipes
3. Click a recipe to see full details
4. Add to meal plan or remove from favorites

### Meal Planner Page (`meal-planner.html`)

Plan your weekly meals and generate shopping lists.

**Features:**
- Weekly grid view with seven days
- Three meal slots per day (Breakfast, Lunch, Dinner)
- Remove meals from plan
- Generate shopping list from planned meals
- Interactive shopping list with checkboxes for tracking

**Workflow:**
1. Add recipes to your meal plan from the home page or favorites
2. View your complete weekly meal plan
3. Click "Generate Shopping List" to create a consolidated list
4. Check off items as you shop
5. Modify your plan as needed

---

## Project Structure

### Root Files

| File | Purpose |
|------|---------|
| `index.html` | Home page with recipe discovery |
| `favorites.html` | Favorites management page |
| `meal-planner.html` | Weekly meal planning interface |
| `README.md` | Project documentation |

### CSS (`src/css/`)

| File | Purpose |
|------|---------|
| `styles.css` | All application styles, includes: header, navigation, search bar, recipe cards, detail views, modals, responsive design, animations, color scheme |

### Images (`src/images/`)

| File | Purpose |
|------|---------|
| `favicon.ico` | The favicon |

### JavaScript (`src/js/`)

| File | Purpose |
|------|---------|
| `app.js` | Home page logic - main entry point for recipe discovery |
| `favHandler.js` | Favorites page logic - manages favorite recipes display |
| `mealPlanner.js` | Meal planner logic - handles meal plan and shopping list |
| `apiHandler.js` | API communication layer - TheMealDB requests |
| `recipeService.js` | Recipe data processing and transformation |
| `storageManager.js` | localStorage operations - persistence layer |
| `uiManager.js` | UI rendering utilities - loading, notifications, filters |
| `utils.js` | General utilities - debounce, formatting, scrolling |

---

## Module Documentation

### APIHandler (`apiHandler.js`)

Manages all TheMealDB API requests with error handling.

**Key Methods:**
- `searchRecipes(query)` - Search recipes by name
- `getRecipeById(id)` - Fetch full recipe details
- `getRandomRecipe()` - Get a random recipe
- `filterByCategory(category)` - Filter recipes by category
- `filterByArea(area)` - Filter recipes by cuisine
- `listCategories()` - Get all available categories
- `listAreas()` - Get all available cuisines

**API Base URL:** `https://www.themealdb.com/api/json/v1/1`

### RecipeService (`recipeService.js`)

Processes and transforms raw API data into application-ready format.

**Key Methods:**
- `parseIngredients(meal)` - Extract ingredients with measurements
- `processRecipe(meal)` - Transform single recipe object
- `processRecipes(meals)` - Batch process multiple recipes
- `filterRecipes(recipes, filters)` - Client-side recipe filtering

**Data Transformation:**
- Raw API fields → Clean, normalized recipe objects
- Ingredient parsing from numbered fields to arrays
- Tag extraction and formatting

### StorageManager (`storageManager.js`)

Handles all localStorage operations with error handling.

**Key Methods:**
- `saveFavorites(favorites)` - Persist favorite recipe IDs
- `getFavorites()` - Retrieve favorite recipe IDs
- `saveMealPlan(mealPlan)` - Persist weekly meal plan
- `getMealPlan()` - Retrieve meal plan
- `savePreferences(preferences)` - Store user preferences
- `getPreferences()` - Retrieve user preferences
- `getEmptyMealPlan()` - Generate empty meal plan structure

**Storage Keys:**
- `favorites` - Array of recipe IDs
- `mealPlan` - Object with weekly structure
- `preferences` - User settings and filters

### UIManager (`uiManager.js`)

Handles all UI rendering and user feedback.

**Key Methods:**
- `showLoading()` - Display loading spinner
- `hideLoading()` - Hide loading spinner
- `showNotification(message, duration)` - Toast notifications
- `populateFilters(categories, areas)` - Populate filter dropdowns

### Utils (`utils.js`)

Reusable utility functions.

**Key Methods:**
- `debounce(func, wait)` - Debounce function execution
- `formatDate(date)` - Format dates for display
- `capitalize(str)` - Capitalize strings
- `generateId()` - Generate unique identifiers
- `scrollToTop()` - Smooth scroll to top
- `isInViewport(element)` - Check element visibility

### Page-Specific Modules

#### RecipeApp (`app.js`)
Main application class for the home page.
- Recipe search and filtering
- Detail view management
- Favorite management
- Meal plan modal handling

#### FavoritesApp (`favHandler.js`)
Favorites page application class.
- Load and display favorites
- Recipe detail view
- Add to meal plan from favorites
- Remove from favorites

#### MealPlannerApp (`mealPlanner.js`)
Meal planner page application class.
- Load and display meal plan
- Remove meals from plan
- Generate shopping lists
- Categorize ingredients

---

## API Integration

### TheMealDB API

The application uses the free **TheMealDB API** for recipe data.

**Key Endpoints Used:**

| Endpoint | Purpose |
|----------|---------|
| `/search.php?s={query}` | Search recipes by name |
| `/lookup.php?i={id}` | Get recipe details by ID |
| `/random.php` | Get random recipe |
| `/filter.php?c={category}` | Filter by category |
| `/filter.php?a={area}` | Filter by cuisine |
| `/categories.php` | List all categories |
| `/list.php?a=list` | List all cuisines |

**API Response Format:**
- JSON responses with `meals` array containing recipe objects
- Full recipe data includes:
  - Recipe ID, name, image URL
  - Category, cuisine/area, tags
  - Ingredients (fields 1-20) with measurements
  - Instructions, video links
  - Thumbnails and source URLs

**Error Handling:**
- Empty array returned for failed requests
- Try-catch blocks in all API calls
- User notifications for API errors
- Graceful degradation

---

## Data Persistence

### LocalStorage Structure

**Favorites**
```json
{
  "favorites": ["52772", "52771", "52001"]
}
```

**Meal Plan**
```json
{
  "mealPlan": {
    "monday": { "breakfast": "52001", "lunch": "52002", "dinner": "52003" },
    "tuesday": { "breakfast": null, "lunch": "52004", "dinner": "52005" },
    ...
  }
}
```

**Preferences**
```json
{
  "preferences": {
    "lastCategory": "Seafood",
    "lastArea": "Italian"
  }
}
```

### Storage Limits & Considerations

- **Capacity** - Most browsers support 5-10MB of localStorage
- **Persistence** - Data persists across browser sessions
- **Clearing** - Data cleared when browser cache/cookies are cleared
- **Scope** - Data is origin-specific (domain-based)

---

## Development Guidelines

### Adding New Features

#### 1. New Recipe Filter
- Add method to `APIHandler` for API request
- Process data in `RecipeService`
- Update UI in appropriate page module
- Add UI elements to corresponding HTML file

#### 2. New Storage Property
- Add getter/setter to `StorageManager`
- Update any dependent modules
- Initialize in application constructor

#### 3. New Page
- Create HTML file with proper structure
- Create JavaScript module class extending from page patterns
- Import and initialize on DOMContentLoaded
- Add navigation links to header

### Code Style

**JavaScript Conventions:**
- Use ES6 modules
- Use meaningful variable names
- Document functions with JSDoc comments
- Handle errors with try-catch
- Use async/await for promises

**CSS Conventions:**
- Use CSS variables for colors and measurements
- Use semantic class names
- Mobile-first responsive design
- Organize by component

### Testing Recommendations

1. **Unit Testing** - Test individual module functions
2. **Integration Testing** - Test module interactions
3. **E2E Testing** - Test complete user workflows
4. **Browser Testing** - Test across different browsers
5. **Performance Testing** - Monitor API call frequency

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Use CORS proxy or run locally with server |
| Modules not loading | Ensure you're using a local server, not file:// |
| localStorage not working | Check browser privacy settings |
| API calls failing | Verify internet connection, check API status |
| Styling issues | Clear browser cache, check CSS file path |

---

## Browser Support

### Supported Browsers

| Browser | Min Version | Status |
|---------|-------------|--------|
| Chrome | 61+ | ✅ Fully Supported |
| Firefox | 67+ | ✅ Fully Supported |
| Safari | 11+ | ✅ Fully Supported |
| Edge | 79+ | ✅ Fully Supported |
| IE 11 | N/A | ❌ Not Supported |
| Mobile Safari | 11+ | ✅ Fully Supported |
| Chrome Mobile | 61+ | ✅ Fully Supported |

### Required Features

- ES6 Module support (`<script type="module">`)
- Fetch API
- Promise support
- Template literals
- localStorage API
- CSS Grid & Flexbox
- CSS Variables

---

## Future Enhancements

### Short-term Improvements

1. **Recipe Ratings** - Add user rating system for recipes
2. **Search History** - Remember recent searches
3. **Dietary Filters** - Add allergen and dietary restriction filters
4. **Recipe Notes** - Allow users to add personal notes to recipes
5. **Share Functionality** - Share recipes and meal plans
6. **Dark Mode** - Add dark theme option

### Medium-term Enhancements

1. **Recipe Collections** - Create themed recipe collections
2. **Nutrition Info** - Display nutritional data when available
3. **Ingredient Substitutions** - Suggest ingredient alternatives
4. **Export Shopping List** - PDF/email shopping list export
5. **Meal Planner Presets** - Pre-built weekly meal plans
6. **User Authentication** - Cloud sync of favorites and meal plans
7. **Multiple Meal Plans** - Support for multiple weekly plans

### Long-term Vision

1. **Mobile App** - Native iOS/Android applications
2. **Backend Database** - Custom recipe database
3. **User Community** - User-submitted recipes and reviews
4. **Advanced Analytics** - Track nutrition, shopping costs, cooking frequency
5. **Recipe Editor** - Create and share custom recipes
6. **AI Recommendations** - Smart recipe suggestions based on preferences
7. **Social Features** - Recipe sharing, cooking groups, meal planning with friends

---

## Author

Created by Anderson Havah

---

## Resources

- **TheMealDB API** - https://www.themealdb.com/api
- **MDN Web Docs** - https://developer.mozilla.org/
- **CSS Grid Guide** - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- **JavaScript Modules** - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

---

## Support & Troubleshooting

### FAQ

**Q: Why do I get CORS errors?**  
A: The TheMealDB API has CORS enabled, but if you're accessing via `file://`, you'll need to use a local server instead.

**Q: How do I clear my favorites and meal plan?**  
A: Open browser DevTools (F12) → Application → LocalStorage → Clear all entries related to this domain.

**Q: Can I use this offline?**  
A: The application requires an internet connection for recipe API calls, but your saved favorites and meal plans will be available offline.

**Q: How many recipes are available?**  
A: TheMealDB has thousands of recipes across many categories and cuisines.

**Q: Is my data secure?**  
A: All data is stored locally in your browser. No data is sent to external servers except for TheMealDB API calls.

---

**Last Updated:** May 3, 2026  
**Version:** 1.0.0


