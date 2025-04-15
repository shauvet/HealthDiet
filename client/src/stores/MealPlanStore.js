import { makeAutoObservable, runInAction } from 'mobx';
import api from '../api/axiosConfig';
import inventoryStore from './InventoryStore';

class MealPlanStore {
  mealPlans = [];
  loading = false;
  error = null;
  _lastFetchKey = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Fetch meal plans for a date range
  async fetchMealPlans(startDate, endDate) {
    // 检查是否已经有这个日期范围的数据
    const cacheKey = `${startDate}-${endDate}`;
    if (this._lastFetchKey === cacheKey && this.mealPlans.length > 0) {
      console.log('Using cached meal plans for', cacheKey);
      return this.mealPlans;
    }
    
    console.log('Fetching from API for', cacheKey);
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get(`/meal-plans?startDate=${startDate}&endDate=${endDate}`);
      runInAction(() => {
        this.mealPlans = response.data;
        this.error = null;
        this._lastFetchKey = cacheKey; // 存储最后一次成功请求的缓存键
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
      console.log('Checking ingredient availability for meal:', mealId);
      
      // 如果没有提供mealId，尝试使用当前选择的膳食计划ID
      let effectiveMealId = mealId;
      
      // 如果仍然没有effectiveMealId，尝试从已加载的膳食计划中获取第一个
      if (!effectiveMealId) {
        console.log('No meal ID provided, trying to use first available plan');
        
        // 尝试从已加载的膳食计划中获取第一个
        if (this.mealPlans && this.mealPlans.length > 0) {
          const firstMeal = this.mealPlans[0];
          effectiveMealId = firstMeal._id || firstMeal.id;
          console.log('Using first available meal ID:', effectiveMealId);
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
        // 1. 首先获取膳食计划详情来获取所有食材信息
        let mealPlanDetails = null;
        try {
          // 获取膳食计划详情
          const detailsResponse = await api.get(`/meal-plans/${effectiveMealId}`);
          mealPlanDetails = detailsResponse.data;
        } catch (detailsError) {
          console.error('Failed to get meal plan details:', detailsError);
        }
        
        // 如果获取不到详情或没有配料信息，回退到原来的单个检查方式
        if (!mealPlanDetails || !mealPlanDetails.ingredients || !Array.isArray(mealPlanDetails.ingredients)) {
          console.log('No ingredients found in meal plan, falling back to single check');
          const response = await api.get(`/meal-plans/${effectiveMealId}/ingredients/check`);
          
          // 检查响应是否有效并处理结果...
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
        }
        
        // 2. 使用批量检查接口
        console.log('Using batch check API with ingredients:', mealPlanDetails.ingredients);
        
        // 调用批量检查接口
        const response = await api.post(`/meal-plans/${effectiveMealId}/ingredients/batch-check`, {
          ingredients: mealPlanDetails.ingredients
        });
        
        // 检查响应是否有效
        if (!response || !response.data) {
          console.error('Invalid response from batch API:', response);
          // 返回默认对象
          return {
            available: [],
            outOfStock: [{ name: "批量检查食材失败", quantity: 1, unit: "个" }],
            lowStock: [],
            mealPlanFound: false,
            apiError: true
          };
        }
        
        // 返回API的响应数据
        console.log('Batch API response data:', response.data);
        
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
      // 查找对应的膳食计划
      const meal = this.mealPlans.find(m => 
        (m.id === mealId || m._id === mealId)
      );
      
      if (!meal) {
        console.warn('Meal plan not found:', mealId);
        return { success: false, message: '未找到膳食计划' };
      }
      
      // 获取食材列表
      let ingredients = [];
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        ingredients = meal.ingredients;
      } else if (meal.recipe && meal.recipe.ingredients && Array.isArray(meal.recipe.ingredients)) {
        ingredients = meal.recipe.ingredients;
      } else if (meal.recipeId && typeof meal.recipeId === 'object' && 
                 meal.recipeId.ingredients && Array.isArray(meal.recipeId.ingredients)) {
        ingredients = meal.recipeId.ingredients;
      }
      
      if (!ingredients || ingredients.length === 0) {
        console.warn('No ingredients found for meal:', mealId);
        return { success: false, message: '膳食计划中没有食材信息' };
      }
      
      // 过滤出购物清单中已有的食材
      const ingredientsInShoppingList = ingredients.filter(ingredient => 
        inventoryStore.shoppingList.some(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase()
        )
      );
      
      if (ingredientsInShoppingList.length === 0) {
        console.warn('No ingredients in shopping list for meal:', mealId);
        return { success: false, message: '购物清单中没有相关食材' };
      }
      
      // 准备添加到购物清单的食材数据
      const ingredientsToAdd = ingredientsInShoppingList.map(item => ({
        name: item.name,
        requiredQuantity: item.quantity,
        toBuyQuantity: item.quantity,
        unit: item.unit,
        category: item.category || 'others'
      }));
      
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
