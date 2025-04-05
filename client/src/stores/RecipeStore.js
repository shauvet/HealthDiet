import { makeAutoObservable } from 'mobx';
import api from '../api/axiosConfig';

class RecipeStore {
  recipes = {
    recommended: [],
    personal: [],
    favorite: []
  };
  loading = false;
  error = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Fetch recommended recipes from network
  async fetchRecommendedRecipes() {
    this.loading = true;
    try {
      const response = await api.get('/recipes/recommended');
      this.recipes.recommended = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch user's personal recipes
  async fetchPersonalRecipes() {
    this.loading = true;
    try {
      const response = await api.get('/recipes/personal');
      this.recipes.personal = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch favorite recipes
  async fetchFavoriteRecipes() {
    this.loading = true;
    try {
      const response = await api.get('/recipes/favorite');
      this.recipes.favorite = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Toggle favorite status of a recipe
  async toggleFavorite(recipeId) {
    try {
      await api.post(`/recipes/${recipeId}/favorite`);
      await this.fetchFavoriteRecipes();
      await this.fetchRecommendedRecipes();
    } catch (error) {
      this.error = error.message;
    }
  }
  
  // Add a recipe to meal plan
  async addToMealPlan(recipeId, date, mealType, servings) {
    try {
      await api.post('/mealplan/add', {
        recipeId,
        date,
        mealType,
        servings
      });
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    }
  }
  
  // Create a new personal recipe
  async createRecipe(recipeData) {
    this.loading = true;
    try {
      await api.post('/recipes', recipeData);
      await this.fetchPersonalRecipes();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Update an existing personal recipe
  async updateRecipe(recipeId, recipeData) {
    this.loading = true;
    try {
      await api.put(`/recipes/${recipeId}`, recipeData);
      await this.fetchPersonalRecipes();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Search recipes by name or ingredient
  async searchRecipes(query) {
    this.loading = true;
    try {
      const response = await api.get(`/recipes/search?q=${query}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
      return [];
    } finally {
      this.loading = false;
    }
  }
}

export default new RecipeStore(); 
