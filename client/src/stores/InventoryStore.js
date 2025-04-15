import { makeAutoObservable, runInAction } from 'mobx';
import api from '../api/axiosConfig';

class InventoryStore {
  ingredients = [];
  shoppingList = [];
  loading = false;
  error = null;
  categories = ['vegetables', 'meat', 'condiments', 'dairy', 'grains', 'fruits', 'others'];
  fetchingShoppingList = false;
  lastShoppingListPromise = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Fetch all ingredients in inventory
  async fetchInventory() {
    this.loading = true;
    try {
      const response = await api.get('/inventory');
      
      // Normalize IDs to ensure both id and _id exist on all objects
      let normalizedData = [];
      if (Array.isArray(response.data)) {
        normalizedData = response.data.map(item => {
          // If neither id nor _id exists, this is a problem
          if (!item.id && !item._id) {
            console.error('Item missing both id and _id:', item);
            return item;
          }
          
          // Ensure both id and _id exist
          return {
            ...item,
            id: item.id || item._id,
            _id: item._id || item.id
          };
        });
      }
      
      runInAction(() => {
        this.ingredients = normalizedData;
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
  
  // Add new ingredient to inventory
  async addIngredient(ingredientData) {
    this.loading = true;
    try {
      await api.post('/inventory', ingredientData);
      await this.fetchInventory();
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
  
  // Update ingredient quantity
  async updateIngredientQuantity(ingredientId, quantity) {
    this.loading = true;
    try {
      await api.put(`/inventory/${ingredientId}`, { quantity });
      
      // Update local state
      runInAction(() => {
        const index = this.ingredients.findIndex(i => (i.id === ingredientId || i._id === ingredientId));
        if (index !== -1) {
          this.ingredients[index].quantity = quantity;
        }
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
  
  // Remove ingredient from inventory
  async removeIngredient(ingredientId) {
    // Validate the ingredient ID
    if (!ingredientId) {
      console.error('Invalid ingredient ID for deletion');
      runInAction(() => {
        this.error = 'Invalid ingredient ID';
      });
      return false;
    }
    
    this.loading = true;
    try {
      await api.delete(`/inventory/${ingredientId}`);
      
      // Update local state
      runInAction(() => {
        this.ingredients = this.ingredients.filter(i => (i.id !== ingredientId && i._id !== ingredientId));
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
  
  // Fetch shopping list based on meal plan
  async fetchShoppingList() {
    // 检查是否有正在进行的请求
    if (this.fetchingShoppingList) {
      console.log('fetchShoppingList: Another request is already in progress, skipping...');
      return this.lastShoppingListPromise;
    }
    
    this.loading = true;
    // 添加堆栈跟踪以识别调用来源
    console.log('----------- fetchShoppingList called -----------');
    console.log('Call stack:', new Error().stack);
    console.log('Fetching shopping list...');
    
    // 标记开始获取
    this.fetchingShoppingList = true;
    
    // 创建请求并保存Promise引用
    this.lastShoppingListPromise = (async () => {
      try {
        const response = await api.get('/inventory/shopping-list');
        console.log('Shopping list API response:', response.data);
        
        // Normalize IDs to ensure both id and _id exist on all objects
        let normalizedData = [];
        if (Array.isArray(response.data)) {
          normalizedData = response.data.map(item => {
            // If neither id nor _id exists, this is a problem
            if (!item.id && !item._id) {
              console.error('Shopping item missing both id and _id:', item);
              return item;
            }
            
            // Ensure both id and _id exist
            return {
              ...item,
              id: item.id || item._id,
              _id: item._id || item.id
            };
          });
        }
        
        console.log('Normalized shopping list data:', normalizedData);
        
        runInAction(() => {
          this.shoppingList = normalizedData;
          this.error = null;
          console.log('Updated shopping list in store, count:', this.shoppingList.length);
        });
        
        return normalizedData;
      } catch (error) {
        console.error('Error fetching shopping list:', error);
        runInAction(() => {
          this.error = error.message;
        });
        throw error;
      } finally {
        runInAction(() => {
          this.loading = false;
          // 标记请求完成
          this.fetchingShoppingList = false;
        });
      }
    })();
    
    return this.lastShoppingListPromise;
  }
  
  // Mark ingredients as purchased
  async markAsPurchased(ingredientIds) {
    this.loading = true;
    try {
      // Send the request to mark items as purchased
      // The server should handle adding purchased items to inventory
      // and updating quantities based on meal plan consumption
      await api.post('/inventory/shopping-list/purchase-multiple', { 
        ids: ingredientIds 
      });
      
      // Refresh both shopping list and inventory data
      await this.fetchShoppingList();
      await this.fetchInventory();
      
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
