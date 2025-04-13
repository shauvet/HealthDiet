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
      const response = await api.get('/recipes/favorites');
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
  async toggleFavorite(recipeId, isFavorite) {
    try {
      if (isFavorite) {
        // 如果已收藏，则调用取消收藏接口
        await api.delete(`/recipes/${recipeId}/favorite`);
      } else {
        // 如果未收藏，则调用添加收藏接口
        await api.post(`/recipes/${recipeId}/favorite`);
      }
      // 更新收藏列表和推荐列表
      await this.fetchFavoriteRecipes();
      await this.fetchRecommendedRecipes();
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error; // 重新抛出错误，以便调用者可以处理
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
      const response = await api.post('/recipes', dataWithoutImage);
      
      // 如果服务器返回了新创建的菜谱，立即添加到个人菜谱列表
      if (response.data && response.data.recipe) {
        runInAction(() => {
          this.recipes.personal.push(response.data.recipe);
        });
      }
      
      // 无论如何，重新获取个人菜谱列表以确保数据最新
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
  
  // Update recipe ingredients
  async updateRecipeIngredients(recipeId, ingredients) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.patch(`/recipes/${recipeId}/ingredients`, { ingredients });
      
      // After updating the ingredients, refresh the recipes
      await this.fetchPersonalRecipes();
      await this.fetchRecommendedRecipes();
      await this.fetchFavoriteRecipes();
      
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Get a single recipe by ID
  async getRecipeById(recipeId) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get(`/recipes/${recipeId}`);
      runInAction(() => {
        this.error = null;
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      runInAction(() => {
        this.error = error.message;
      });
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default new RecipeStore(); 
