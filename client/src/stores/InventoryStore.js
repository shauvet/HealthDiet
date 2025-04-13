import { makeAutoObservable, runInAction } from 'mobx';
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
    this.loading = true;
    console.log('Fetching shopping list...');
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
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
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
  
  // 自动检查已点菜单中食材与库存进行比对，并将不足的食材添加到采购清单
  async checkAndAddMenuIngredientsToShoppingList() {
    console.log('Checking meal plans for ingredients to add to shopping list...');
    this.loading = true;
    try {
      // 获取当前用户的膳食计划
      const mealPlanResponse = await api.get('/meal-plans/current-week');
      const mealPlans = mealPlanResponse.data;
      console.log('Current week meal plans:', mealPlans);
      
      if (!mealPlans || !Array.isArray(mealPlans) || mealPlans.length === 0) {
        console.log('No meal plans found for current week');
        return;
      }
      
      // 对每个膳食计划检查库存情况
      for (const mealPlan of mealPlans) {
        const mealId = mealPlan._id || mealPlan.id;
        if (!mealId) continue;
        
        try {
          console.log(`Checking ingredient availability for meal plan: ${mealId}`);
          // 获取膳食计划的食材库存状态
          const response = await api.get(`/meal-plans/${mealId}/ingredients/check`);
          
          // 如果API响应包含缺货或库存不足的食材
          if (response.data) {
            const { outOfStock, lowStock } = response.data;
            
            // 准备要添加到购物清单的食材
            const ingredientsToAdd = [];
            
            // 处理缺货的食材
            if (outOfStock && outOfStock.length > 0) {
              console.log(`Found ${outOfStock.length} out of stock ingredients for meal ${mealId}`);
              // 确保字段名称正确
              const formattedOutOfStock = outOfStock.map(item => ({
                name: item.name,
                requiredQuantity: item.quantity,
                toBuyQuantity: item.quantity,
                quantity: item.quantity, // 兼容旧API
                unit: item.unit,
                category: item.category || 'others'
              }));
              ingredientsToAdd.push(...formattedOutOfStock);
            }
            
            // 处理库存不足的食材
            if (lowStock && lowStock.length > 0) {
              console.log(`Found ${lowStock.length} low stock ingredients for meal ${mealId}`);
              // 对于库存不足的食材，只添加缺少的部分数量
              const lowStockToAdd = lowStock.map(item => {
                const missingQuantity = item.quantity - (item.availableQuantity || 0);
                return {
                  name: item.name,
                  requiredQuantity: missingQuantity,
                  toBuyQuantity: missingQuantity,
                  quantity: missingQuantity, // 兼容旧API
                  unit: item.unit,
                  category: item.category || 'others'
                };
              });
              
              // 确保数量大于0
              const validLowStock = lowStockToAdd.filter(item => item.requiredQuantity > 0);
              ingredientsToAdd.push(...validLowStock);
            }
            
            // 如果有需要添加的食材，添加到购物清单
            if (ingredientsToAdd.length > 0) {
              console.log(`Adding ${ingredientsToAdd.length} ingredients to shopping list from meal ${mealId}`);
              console.log('Ingredients to add (first 3):', JSON.stringify(ingredientsToAdd.slice(0, 3), null, 2));
              
              try {
                const response = await api.post(`/meal-plans/${mealId}/shopping-list/add`, {
                  ingredients: ingredientsToAdd
                });
                console.log('API response from adding ingredients:', response.data);
              } catch (addError) {
                console.error('Error in API call to add ingredients:', addError.message);
                if (addError.response) {
                  console.error('API error response:', addError.response.data);
                }
                throw addError;
              }
            }
          }
        } catch (error) {
          console.error(`Error checking meal plan ${mealId}:`, error);
          // 继续检查下一个膳食计划
        }
      }
      
      // 完成后，刷新购物清单
      await this.fetchShoppingList();
      
      runInAction(() => {
        this.error = null;
      });
    } catch (error) {
      console.error('Error checking meal plans:', error);
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default new InventoryStore(); 
