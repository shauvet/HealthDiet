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
      
      // 确保每个食谱都有id字段
      const processedRecipes = response.data.map(recipe => {
        // 如果没有id字段，使用_id作为id
        if (!recipe.id && recipe._id) {
          recipe.id = recipe._id.toString();
        }
        return recipe;
      });
      
      runInAction(() => {
        this.recipes.recommended = processedRecipes;
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
      
      // 确保每个食谱都有id字段
      const processedRecipes = response.data.map(recipe => {
        // 如果没有id字段，使用_id作为id
        if (!recipe.id && recipe._id) {
          recipe.id = recipe._id.toString();
        }
        return recipe;
      });
      
      runInAction(() => {
        this.recipes.personal = processedRecipes;
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
      
      // 收藏列表通常已经进行过标准化处理，但仍然需要检查
      const processedRecipes = response.data.map(recipe => {
        // 如果没有id字段但有其他ID字段，进行转换
        if (!recipe.id) {
          if (recipe._id) {
            recipe.id = recipe._id.toString();
          } else if (recipe.recipeId) {
            recipe.id = recipe.recipeId.toString();
          }
        }
        // 确保标记为已收藏
        recipe.isFavorite = true;
        return recipe;
      });
      
      runInAction(() => {
        this.recipes.favorite = processedRecipes;
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
      // 参数验证
      if (!recipeId) {
        console.error("Cannot toggle favorite: Missing recipe ID");
        throw new Error("Missing recipe ID");
      }
      
      // 转换为字符串确保一致性
      const id = recipeId.toString();
      
      console.log(`Toggling favorite for recipe: ${id}, current status: ${isFavorite ? 'favorited' : 'not favorited'}`);
      
      if (isFavorite) {
        // 如果已收藏，则调用取消收藏接口
        await api.delete(`/recipes/${id}/favorite`);
      } else {
        // 如果未收藏，则调用添加收藏接口
        await api.post(`/recipes/${id}/favorite`);
      }
      
      // 更新收藏列表和推荐列表
      await this.fetchFavoriteRecipes();
      await this.fetchRecommendedRecipes();
      
      console.log(`Successfully ${isFavorite ? 'unfavorited' : 'favorited'} recipe: ${id}`);
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      
      // 记录详细错误信息
      console.error(`Error toggling favorite status for recipe ${recipeId}:`, error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      
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
