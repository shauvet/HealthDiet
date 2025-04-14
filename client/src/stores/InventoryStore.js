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
  async checkAndAddMenuIngredientsToShoppingList(refreshShoppingList = false) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      console.log('Checking meal plans for missing ingredients...');
      // 获取当前周的膳食计划
      const response = await api.get('/meal-plans/current-week');
      const mealPlans = response.data;
      
      if (!mealPlans || !Array.isArray(mealPlans) || mealPlans.length === 0) {
        console.log('No meal plans found for current week');
        return;
      }
      
      // 合并所有膳食计划的食材，只请求一次批量检查
      let allIngredients = [];
      // 记录每个膳食计划的ID以便后续处理
      const mealIds = [];
      
      // 收集所有膳食计划的食材
      for (const mealPlan of mealPlans) {
        const mealId = mealPlan._id || mealPlan.id;
        if (!mealId) continue;
        
        mealIds.push(mealId);
        
        // 从膳食计划中获取食材
        let ingredients = [];
        
        // 如果膳食计划有直接的食材列表，则使用
        if (mealPlan.ingredients && Array.isArray(mealPlan.ingredients)) {
          ingredients = mealPlan.ingredients;
        }
        // 如果食谱对象中包含食材列表，则从那里收集
        else if (mealPlan.recipeId && mealPlan.recipeId.ingredients && Array.isArray(mealPlan.recipeId.ingredients)) {
          ingredients = mealPlan.recipeId.ingredients;
        }
        // 如果有recipe属性并包含食材
        else if (mealPlan.recipe && mealPlan.recipe.ingredients && Array.isArray(mealPlan.recipe.ingredients)) {
          ingredients = mealPlan.recipe.ingredients;
        }
        
        // 合并到总食材列表中
        if (ingredients.length > 0) {
          // 合并食材，不使用标记
          allIngredients = [...allIngredients, ...ingredients];
        }
      }
      
      // 如果没有收集到任何食材，尝试获取膳食计划详情
      if (allIngredients.length === 0 && mealIds.length > 0) {
        // 只获取第一个膳食计划详情
        try {
          console.log(`Fetching details for meal plan ${mealIds[0]} to get ingredients`);
          const detailResponse = await api.get(`/meal-plans/${mealIds[0]}`);
          const detailData = detailResponse.data;
          
          let detailIngredients = [];
          if (detailData.ingredients && Array.isArray(detailData.ingredients)) {
            detailIngredients = detailData.ingredients;
          }
          else if (detailData.recipeId && detailData.recipeId.ingredients && Array.isArray(detailData.recipeId.ingredients)) {
            detailIngredients = detailData.recipeId.ingredients;
          }
          else if (detailData.recipe && detailData.recipe.ingredients && Array.isArray(detailData.recipe.ingredients)) {
            detailIngredients = detailData.recipe.ingredients;
          }
          
          if (detailIngredients.length > 0) {
            allIngredients = [...detailIngredients];
          }
        } catch (detailError) {
          console.error(`Error fetching details for meal:`, detailError);
        }
      }
      
      // 如果仍然没有食材，直接返回
      if (allIngredients.length === 0) {
        console.log('No ingredients found in any meal plan');
        runInAction(() => {
          this.loading = false;
        });
        return;
      }
      
      console.log(`Batch checking availability for all ${allIngredients.length} ingredients from ${mealIds.length} meal plans`);
      
      // 发起一次批量查询，使用第一个膳食计划ID
      try {
        const batchResponse = await api.post(`/meal-plans/${mealIds[0]}/ingredients/batch-check`, {
          ingredients: allIngredients
        });
        
        if (!batchResponse.data) {
          console.error('Invalid batch check response');
          return;
        }
        
        // 获取结果
        const { outOfStock, lowStock } = batchResponse.data;
        
        if (!outOfStock && !lowStock) {
          console.log('No out of stock or low stock ingredients found');
          return;
        }
        
        // 合并所有需要添加到购物清单的食材
        const ingredientsToAdd = [];
        
        // 处理缺货的食材
        if (outOfStock && outOfStock.length > 0) {
          const formattedOutOfStock = outOfStock.map(item => ({
            name: item.name,
            requiredQuantity: item.quantity,
            toBuyQuantity: item.quantity,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category || 'others'
          }));
          ingredientsToAdd.push(...formattedOutOfStock);
        }
        
        // 处理库存不足的食材
        if (lowStock && lowStock.length > 0) {
          const lowStockToAdd = lowStock.map(item => {
            const missingQuantity = item.quantity - (item.availableQuantity || 0);
            return {
              name: item.name,
              requiredQuantity: missingQuantity,
              toBuyQuantity: missingQuantity,
              quantity: missingQuantity,
              unit: item.unit,
              category: item.category || 'others'
            };
          }).filter(item => item.requiredQuantity > 0);
          
          ingredientsToAdd.push(...lowStockToAdd);
        }
        
        // 如果有需要添加的食材，添加到购物清单
        if (ingredientsToAdd.length > 0) {
          console.log(`Adding ${ingredientsToAdd.length} ingredients to shopping list`);
          try {
            // 使用第一个膳食计划ID添加到购物清单
            const addResponse = await api.post(`/meal-plans/${mealIds[0]}/shopping-list/add`, {
              ingredients: ingredientsToAdd
            });
            console.log('Successfully added ingredients to shopping list:', addResponse.data);
          } catch (addError) {
            console.error('Error adding ingredients to shopping list:', addError);
          }
        }
      } catch (batchError) {
        console.error('Error in batch checking ingredients:', batchError);
      }
      
      // 只有当参数为true时才刷新购物清单
      if (refreshShoppingList) {
        await this.fetchShoppingList();
      }
      
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
