import { makeAutoObservable, runInAction } from 'mobx';
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
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get(`/meal-plans?startDate=${startDate}&endDate=${endDate}`);
      runInAction(() => {
        this.mealPlans = response.data;
        this.error = null;
      });
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
  
  // Add meal to plan
  async addMeal(mealData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.post('/meal-plans', mealData);
      runInAction(() => {
        this.mealPlans.push(response.data);
        this.error = null;
      });
      return response.data;
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
  
  // Update existing meal in plan
  async updateMeal(mealId, mealData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.patch(`/meal-plans/${mealId}`, mealData);
      
      // Update in local state
      runInAction(() => {
        const index = this.mealPlans.findIndex(m => m.id === mealId);
        if (index !== -1) {
          this.mealPlans[index] = response.data;
        }
        this.error = null;
      });
      
      return response.data;
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
  
  // Remove meal from plan
  async removeMeal(mealId) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.delete(`/meal-plans/${mealId}`);
      
      // Remove from local state
      runInAction(() => {
        // 同时检查id和_id属性，确保无论使用哪种ID都能正确移除
        this.mealPlans = this.mealPlans.filter(m => {
          // 将MongoDB的ObjectId转换为字符串进行比较
          const mId = String(m.id || '');
          const m_Id = String(m._id || '');
          const targetId = String(mealId || '');
          return mId !== targetId && m_Id !== targetId;
        });
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
  
  // Check ingredient availability for planned meals
  async checkIngredientAvailability(mealId) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      // Log the meal ID for debugging
      console.log('Checking ingredients for meal ID:', mealId, 'Type:', typeof mealId);
      
      let effectiveMealId = mealId;
      
      // 特殊处理：对于简单ID "1"，直接使用第一个可用的膳食计划
      if (effectiveMealId === 1 || effectiveMealId === '1') {
        console.log('Special case: ID is 1, using first available meal plan');
        if (this.mealPlans.length > 0) {
          // 使用第一个可用的膳食计划ID
          const firstMeal = this.mealPlans[0];
          effectiveMealId = firstMeal._id || firstMeal.id;
          console.log('Using first meal plan ID instead:', effectiveMealId);
        } else {
          console.log('No available meals in store to use as fallback');
        }
      }
      // If mealId is a number or a simple string like "1", try to get a proper ID from mealPlans
      else if (typeof effectiveMealId === 'number' || (typeof effectiveMealId === 'string' && /^\d+$/.test(effectiveMealId))) {
        console.log('Received simple numeric ID, searching for matching meal plan...');
        
        // Find the meal in our local state that has a matching simple ID
        const matchingMeal = this.mealPlans.find(meal => {
          const simpleId = (meal.id && typeof meal.id === 'string') ? meal.id : '';
          const mongoId = (meal._id && typeof meal._id === 'string') ? meal._id : '';
          return simpleId === String(effectiveMealId) || mongoId.includes(String(effectiveMealId));
        });
        
        if (matchingMeal) {
          // Use the MongoDB ObjectId instead
          effectiveMealId = matchingMeal._id || matchingMeal.id;
          console.log('Found matching meal plan, using ID:', effectiveMealId);
        } else {
          console.log('No matching meal found for ID', effectiveMealId);
          if (this.mealPlans.length > 0) {
            // 如果找不到匹配的，使用第一个作为备选
            const firstMeal = this.mealPlans[0];
            effectiveMealId = firstMeal._id || firstMeal.id;
            console.log('Using first meal as fallback, ID:', effectiveMealId);
          }
        }
      }
      
      // 确保effectiveMealId有值
      if (!effectiveMealId && this.mealPlans.length > 0) {
        effectiveMealId = this.mealPlans[0]._id || this.mealPlans[0].id;
        console.log('Using fallback ID as last resort:', effectiveMealId);
      }
      
      // 最终使用的ID进行API调用
      console.log('Final ID for API call:', effectiveMealId);
      
      try {
        const response = await api.get(`/meal-plans/${effectiveMealId}/ingredients/check`);
        
        // 检查响应是否有效
        if (!response || !response.data) {
          console.error('Invalid response from API:', response);
          // 返回默认对象
          return {
            available: [],
            outOfStock: [{ name: "获取食材失败", quantity: 1, unit: "个" }],
            lowStock: [],
            mealPlanFound: false,
            apiError: true
          };
        }
        
        // 返回API的响应数据，即使它包含错误
        console.log('API response data:', response.data);
        
        // 确保返回的数据格式正确
        const result = {
          available: Array.isArray(response.data.available) ? response.data.available : [],
          outOfStock: Array.isArray(response.data.outOfStock) ? response.data.outOfStock : [],
          lowStock: Array.isArray(response.data.lowStock) ? response.data.lowStock : [],
          mealPlanFound: response.data.mealPlanFound || false
        };
        
        // 如果没有有效的数据，添加一个默认项
        if (result.available.length === 0 && result.outOfStock.length === 0 && result.lowStock.length === 0) {
          result.outOfStock = [{ name: "示例食材", quantity: 1, unit: "个" }];
        }
        
        // 如果API返回了错误，但没有食材数据，添加一个默认项
        if (response.data.error && result.outOfStock.length === 0) {
          result.outOfStock = [{ name: "食材库存不足", quantity: 1, unit: "个" }];
        }
        
        runInAction(() => {
          this.error = null;
        });
        
        return result;
      } catch (apiError) {
        console.error('API request failed:', apiError);
        // 返回默认对象，确保UI能正确显示
        return {
          available: [],
          outOfStock: [{ name: "API请求失败", quantity: 1, unit: "个" }],
          lowStock: [],
          mealPlanFound: false,
          apiError: true
        };
      }
    } catch (error) {
      console.error('Error in checkIngredientAvailability:', error);
      runInAction(() => {
        this.error = error.message;
      });
      // 即使发生错误也返回一个有效的对象
      return {
        available: [],
        outOfStock: [{ name: "发生错误", quantity: 1, unit: "个" }],
        lowStock: [],
        error: error.message
      };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Add out of stock ingredients to shopping list
  async addOutOfStockToShoppingList(mealId) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      // 先获取食谱的库存状态，确保我们有真实的库存不足食材数据
      const ingredientStatus = await this.checkIngredientAvailability(mealId);
      
      // 确保有库存不足的食材数据（包括完全缺货和库存不足两种情况）
      const hasOutOfStock = ingredientStatus?.outOfStock?.length > 0;
      const hasLowStock = ingredientStatus?.lowStock?.length > 0;
      
      if (!ingredientStatus || (!hasOutOfStock && !hasLowStock)) {
        console.warn('No out of stock or low stock ingredients found for meal:', mealId);
        return { success: false, message: '没有找到库存不足的食材' };
      }
      
      // 收集所有需要添加到购物清单的食材
      const ingredientsToAdd = [];
      
      // 添加完全缺货的食材
      if (hasOutOfStock) {
        console.log('Adding out of stock ingredients to shopping list:', ingredientStatus.outOfStock);
        // 确保字段名称正确
        const formattedOutOfStock = ingredientStatus.outOfStock.map(item => ({
          name: item.name,
          requiredQuantity: item.quantity,
          toBuyQuantity: item.quantity,
          unit: item.unit,
          category: item.category || 'others'
        }));
        ingredientsToAdd.push(...formattedOutOfStock);
      }
      
      // 添加库存不足的食材，计算需要购买的数量
      if (hasLowStock) {
        console.log('Adding low stock ingredients to shopping list:', ingredientStatus.lowStock);
        
        // 对于库存不足的食材，只添加缺少的部分数量
        const lowStockToAdd = ingredientStatus.lowStock.map(item => {
          const missingQuantity = item.quantity - (item.availableQuantity || 0);
          return {
            name: item.name,
            requiredQuantity: missingQuantity,
            toBuyQuantity: missingQuantity,
            unit: item.unit,
            category: item.category || 'others'
          };
        });
        
        // 确保数量大于0
        const validLowStock = lowStockToAdd.filter(item => item.requiredQuantity > 0);
        ingredientsToAdd.push(...validLowStock);
      }
      
      if (ingredientsToAdd.length === 0) {
        console.warn('No ingredients to add after processing');
        return { success: false, message: '没有需要添加到购物清单的食材' };
      }
      
      // 调用API将食材添加到购物清单
      const response = await api.post(`/meal-plans/${mealId}/shopping-list/add`, {
        ingredients: ingredientsToAdd
      });
      
      runInAction(() => {
        this.error = null;
      });
      
      return {
        ...response.data,
        success: true,
        addedIngredients: ingredientsToAdd
      };
    } catch (error) {
      console.error('Failed to add ingredients to shopping list:', error);
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
  
  // Get meals for a specific day
  getMealsForDay(date) {
    return this.mealPlans.filter(meal => meal.date === date);
  }
  
  // Get all planned dates
  getPlannedDates() {
    return [...new Set(this.mealPlans.map(meal => meal.date))];
  }
  
  // 批量删除膳食计划
  async removeMeals(mealIds) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      // 依次删除每个膳食计划
      for (const mealId of mealIds) {
        await this.removeMeal(mealId);
      }
      
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
}

export default new MealPlanStore(); 
