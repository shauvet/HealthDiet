import { makeAutoObservable } from 'mobx';
import api from '../api/axiosConfig';

class InventoryStore {
  ingredients = [];
  shoppingList = [];
  loading = false;
  error = null;
  categories = ['vegetables', 'meat', 'condiments', 'dairy', 'grains', 'fruits', 'others'];
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Fetch all ingredients in inventory
  async fetchInventory() {
    this.loading = true;
    try {
      const response = await api.get('/inventory');
      this.ingredients = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Add new ingredient to inventory
  async addIngredient(ingredientData) {
    this.loading = true;
    try {
      await api.post('/inventory', ingredientData);
      await this.fetchInventory();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Update ingredient quantity
  async updateIngredientQuantity(ingredientId, quantity) {
    this.loading = true;
    try {
      await api.put(`/inventory/${ingredientId}`, { quantity });
      
      // Update local state
      const index = this.ingredients.findIndex(i => i.id === ingredientId);
      if (index !== -1) {
        this.ingredients[index].quantity = quantity;
      }
      
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Remove ingredient from inventory
  async removeIngredient(ingredientId) {
    this.loading = true;
    try {
      await api.delete(`/inventory/${ingredientId}`);
      
      // Update local state
      this.ingredients = this.ingredients.filter(i => i.id !== ingredientId);
      
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch shopping list based on meal plan
  async fetchShoppingList() {
    this.loading = true;
    try {
      const response = await api.get('/inventory/shopping-list');
      this.shoppingList = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Mark ingredients as purchased
  async markAsPurchased(ingredientIds) {
    this.loading = true;
    try {
      await api.post('/inventory/purchased', { ingredientIds });
      await this.fetchShoppingList();
      await this.fetchInventory();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Get ingredients by category
  getIngredientsByCategory(category) {
    return this.ingredients.filter(ingredient => ingredient.category === category);
  }
  
  // Get ingredients with positive stock
  getInStockIngredients() {
    return this.ingredients.filter(ingredient => ingredient.quantity > 0);
  }
  
  // Get ingredients with zero or negative stock
  getOutOfStockIngredients() {
    return this.ingredients.filter(ingredient => ingredient.quantity <= 0);
  }
}

export default new InventoryStore(); 
