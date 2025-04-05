import { makeAutoObservable } from 'mobx';
import api from '../api/axiosConfig';

class HealthStore {
  nutritionData = null;
  recipeStats = null;
  ingredientStats = null;
  timeRange = 'week'; // 'week', 'month', 'year', 'custom'
  customDateRange = {
    startDate: null,
    endDate: null
  };
  loading = false;
  error = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  setTimeRange(timeRange) {
    this.timeRange = timeRange;
  }
  
  setCustomDateRange(startDate, endDate) {
    this.customDateRange = { startDate, endDate };
  }
  
  // Fetch all stats at once
  async fetchAllStats() {
    await Promise.all([
      this.fetchNutritionData(),
      this.fetchRecipeStats(),
      this.fetchIngredientStats()
    ]);
  }
  
  // Fetch nutrition data for analysis
  async fetchNutritionData() {
    this.loading = true;
    try {
      let endpoint = `/health/nutrition/${this.timeRange}`;
      
      if (this.timeRange === 'custom' && this.customDateRange.startDate && this.customDateRange.endDate) {
        endpoint = `/health/nutrition/custom?startDate=${this.customDateRange.startDate}&endDate=${this.customDateRange.endDate}`;
      }
      
      const response = await api.get(endpoint);
      this.nutritionData = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch recipe statistics
  async fetchRecipeStats() {
    this.loading = true;
    try {
      let endpoint = `/health/recipes/${this.timeRange}`;
      
      if (this.timeRange === 'custom' && this.customDateRange.startDate && this.customDateRange.endDate) {
        endpoint = `/health/recipes/custom?startDate=${this.customDateRange.startDate}&endDate=${this.customDateRange.endDate}`;
      }
      
      const response = await api.get(endpoint);
      this.recipeStats = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch ingredient consumption statistics
  async fetchIngredientStats() {
    this.loading = true;
    try {
      let endpoint = `/health/ingredients/${this.timeRange}`;
      
      if (this.timeRange === 'custom' && this.customDateRange.startDate && this.customDateRange.endDate) {
        endpoint = `/health/ingredients/custom?startDate=${this.customDateRange.startDate}&endDate=${this.customDateRange.endDate}`;
      }
      
      const response = await api.get(endpoint);
      this.ingredientStats = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Get protein data for charts
  getProteinData() {
    return this.nutritionData ? this.nutritionData.protein : [];
  }
  
  // Get fat data for charts
  getFatData() {
    return this.nutritionData ? this.nutritionData.fat : [];
  }
  
  // Get carbs data for charts
  getCarbsData() {
    return this.nutritionData ? this.nutritionData.carbs : [];
  }
  
  // Get vitamins data for charts
  getVitaminsData() {
    return this.nutritionData ? this.nutritionData.vitamins : [];
  }
  
  // Get minerals data for charts
  getMineralsData() {
    return this.nutritionData ? this.nutritionData.minerals : [];
  }
  
  // Get top consumed recipes
  getTopRecipes(limit = 5) {
    if (!this.recipeStats) return [];
    return this.recipeStats.slice(0, limit);
  }
  
  // Get top consumed ingredients
  getTopIngredients(limit = 5) {
    if (!this.ingredientStats) return [];
    return this.ingredientStats.slice(0, limit);
  }
}

export default new HealthStore(); 
