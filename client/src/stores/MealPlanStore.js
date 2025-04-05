import { makeAutoObservable } from 'mobx';
import api from '../api/axiosConfig';

class MealPlanStore {
  mealPlans = [];
  loading = false;
  error = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Fetch meal plans for a date range
  async fetchMealPlans(startDate, endDate) {
    this.loading = true;
    try {
      const response = await api.get(`/meal-plans?startDate=${startDate}&endDate=${endDate}`);
      this.mealPlans = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Add meal to plan
  async addMeal(mealData) {
    this.loading = true;
    try {
      const response = await api.post('/meal-plans', mealData);
      this.mealPlans.push(response.data);
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Update existing meal in plan
  async updateMeal(mealId, mealData) {
    this.loading = true;
    try {
      const response = await api.patch(`/meal-plans/${mealId}`, mealData);
      
      // Update in local state
      const index = this.mealPlans.findIndex(m => m.id === mealId);
      if (index !== -1) {
        this.mealPlans[index] = response.data;
      }
      
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Remove meal from plan
  async removeMeal(mealId) {
    this.loading = true;
    try {
      await api.delete(`/meal-plans/${mealId}`);
      
      // Remove from local state
      this.mealPlans = this.mealPlans.filter(m => m.id !== mealId);
      
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Check ingredient availability for planned meals
  async checkIngredientAvailability(mealId) {
    this.loading = true;
    try {
      const response = await api.get(`/meal-plans/${mealId}/ingredients/check`);
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Get meals for a specific day
  getMealsForDay(date) {
    return this.mealPlans.filter(meal => meal.date === date);
  }
  
  // Get all planned dates
  getPlannedDates() {
    return [...new Set(this.mealPlans.map(meal => meal.date))];
  }
}

export default new MealPlanStore(); 
