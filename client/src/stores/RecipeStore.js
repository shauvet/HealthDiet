import { makeAutoObservable, runInAction } from 'mobx';
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
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get('/recipes/recommended');
      runInAction(() => {
        this.recipes.recommended = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Fetch user's personal recipes
  async fetchPersonalRecipes() {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get('/recipes/personal');
      runInAction(() => {
        this.recipes.personal = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Fetch favorite recipes
  async fetchFavoriteRecipes() {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get('/recipes/favorite');
      runInAction(() => {
        this.recipes.favorite = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Toggle favorite status of a recipe
  async toggleFavorite(recipeId) {
    try {
      await api.post(`/recipes/${recipeId}/favorite`);
      await this.fetchFavoriteRecipes();
      await this.fetchRecommendedRecipes();
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
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
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    }
  }
  
  // Create a new personal recipe
  async createRecipe(recipeData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      // 确保不使用imageUrl，使服务器端使用默认值
      const { imageUrl: _, ...dataWithoutImage } = recipeData;
      await api.post('/recipes', dataWithoutImage);
      await this.fetchPersonalRecipes();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Update an existing personal recipe
  async updateRecipe(recipeId, recipeData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.put(`/recipes/${recipeId}`, recipeData);
      await this.fetchPersonalRecipes();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Search recipes by name or ingredient
  async searchRecipes(query) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get(`/recipes/search?q=${query}`);
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return [];
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default new RecipeStore(); 
