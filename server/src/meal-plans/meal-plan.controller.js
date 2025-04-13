const MealPlanService = require('./meal-plan.service');

// Helper function to transform the meal plan data structure
const transformMealPlans = (mealPlans) => {
  if (!Array.isArray(mealPlans)) {
    // If it's a single object, transform it and return
    if (mealPlans && typeof mealPlans === 'object') {
      return transformMealPlanObject(mealPlans);
    }
    return mealPlans;
  }

  // Process array of meal plans
  return mealPlans.map(transformMealPlanObject);
};

// Helper to transform a single meal plan object
const transformMealPlanObject = (mealPlan) => {
  if (!mealPlan || !mealPlan.recipeId) return mealPlan;

  // Create a new object with all properties from the meal plan
  const transformedMealPlan = {
    ...(mealPlan.toObject ? mealPlan.toObject() : mealPlan),
  };

  // Extract recipe properties from recipeId
  if (typeof transformedMealPlan.recipeId === 'object') {
    // Create a recipe object to maintain reference to the original recipe
    transformedMealPlan.recipe = { ...transformedMealPlan.recipeId };

    // Copy recipe properties to the root level
    const recipeIdObj = transformedMealPlan.recipeId;
    for (const key in recipeIdObj) {
      if (key !== '_id' && key !== '__v') {
        transformedMealPlan[key] = recipeIdObj[key];
      }
    }

    // Store just the ID string in recipeId
    transformedMealPlan.recipeId = recipeIdObj._id;
  }

  return transformedMealPlan;
};

const MealPlanController = {
  // 获取用户指定日期范围内的膳食计划
  async getMealPlans(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: 'Start date and end date are required' });
      }

      const mealPlans = await MealPlanService.getUserMealPlans(
        userId,
        startDate,
        endDate,
      );

      // Transform the data structure before sending the response
      const transformedMealPlans = transformMealPlans(mealPlans);
      res.json(transformedMealPlans);
    } catch (error) {
      console.error('Error getting meal plans:', error);
      res.status(500).json({ error: 'Failed to get meal plans' });
    }
  },

  // 获取用户指定日期的膳食计划
  async getDailyMealPlan(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const mealPlans = await MealPlanService.getDailyMealPlan(userId, date);

      // Transform the data structure before sending the response
      const transformedMealPlans = transformMealPlans(mealPlans);
      res.json(transformedMealPlans);
    } catch (error) {
      console.error('Error getting daily meal plan:', error);
      res.status(500).json({ error: 'Failed to get daily meal plan' });
    }
  },

  // 添加膳食计划
  async addMealPlan(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const mealPlanData = { ...req.body, userId };

      const mealPlan = await MealPlanService.addMealPlan(mealPlanData);
      res.status(201).json(mealPlan);
    } catch (error) {
      console.error('Error adding meal plan:', error);
      res.status(500).json({ error: 'Failed to add meal plan' });
    }
  },

  // 获取单个膳食计划详情
  async getMealPlanById(req, res) {
    try {
      const { id } = req.params;

      const mealPlan = await MealPlanService.getMealPlanById(id);

      if (!mealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      // Transform the data structure before sending the response
      const transformedMealPlan = transformMealPlans(mealPlan);
      res.json(transformedMealPlan);
    } catch (error) {
      console.error('Error getting meal plan:', error);
      res.status(500).json({ error: 'Failed to get meal plan' });
    }
  },

  // 更新膳食计划
  async updateMealPlan(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedMealPlan = await MealPlanService.updateMealPlan(
        id,
        updateData,
      );

      if (!updatedMealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      res.json(updatedMealPlan);
    } catch (error) {
      console.error('Error updating meal plan:', error);
      res.status(500).json({ error: 'Failed to update meal plan' });
    }
  },

  // 删除膳食计划
  async removeMealPlan(req, res) {
    try {
      const { id } = req.params;

      const result = await MealPlanService.removeMealPlan(id);

      if (!result) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      res.json({ success: true, message: 'Meal plan removed successfully' });
    } catch (error) {
      console.error('Error removing meal plan:', error);
      res.status(500).json({ error: 'Failed to remove meal plan' });
    }
  },

  // 批量生成膳食计划
  async generateMealPlans(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const { startDate, endDate, preferences } = req.body;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: 'Start date and end date are required' });
      }

      const mealPlans = await MealPlanService.generateMealPlans(
        userId,
        startDate,
        endDate,
        preferences,
      );
      res.status(201).json(mealPlans);
    } catch (error) {
      console.error('Error generating meal plans:', error);
      res.status(500).json({ error: 'Failed to generate meal plans' });
    }
  },

  // 标记膳食计划为已完成
  async markAsCompleted(req, res) {
    try {
      const { id } = req.params;
      const { completed } = req.body;

      const updatedMealPlan = await MealPlanService.markAsCompleted(
        id,
        completed,
      );

      if (!updatedMealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      res.json(updatedMealPlan);
    } catch (error) {
      console.error('Error marking meal plan as completed:', error);
      res.status(500).json({ error: 'Failed to mark meal plan as completed' });
    }
  },

  // 获取用户最常制作的菜谱
  async getMostFrequentRecipes(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;

      const recipes = await MealPlanService.getMostFrequentRecipes(
        userId,
        limit,
      );
      res.json(recipes);
    } catch (error) {
      console.error('Error getting most frequent recipes:', error);
      res.status(500).json({ error: 'Failed to get most frequent recipes' });
    }
  },

  // 获取用户各餐类型的膳食计划分布
  async getMealTypeDistribution(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const days = req.query.days ? parseInt(req.query.days) : 30;

      const distribution = await MealPlanService.getMealTypeDistribution(
        userId,
        days,
      );
      res.json(distribution);
    } catch (error) {
      console.error('Error getting meal type distribution:', error);
      res.status(500).json({ error: 'Failed to get meal type distribution' });
    }
  },

  // 获取用户当前周的膳食计划
  async getCurrentWeekMealPlans(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      console.log(`Getting current week meal plans for user: ${userId}`);

      const mealPlans = await MealPlanService.getCurrentWeekMealPlans(userId);
      console.log(`Found ${mealPlans.length} meal plans for current week`);

      // Transform the data structure before sending the response
      const transformedMealPlans = transformMealPlans(mealPlans);
      res.json(transformedMealPlans);
    } catch (error) {
      console.error('Error getting current week meal plans:', error);
      res.status(500).json({ error: 'Failed to get current week meal plans' });
    }
  },

  // 检查膳食计划所需配料的库存情况
  async checkIngredientAvailability(req, res) {
    try {
      const { id } = req.params;
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const result = await MealPlanService.checkIngredientAvailability(
        userId,
        id,
      );

      // If there's a mealPlan property in the result, transform it
      if (result && result.mealPlan) {
        result.mealPlan = transformMealPlans(result.mealPlan);
      }

      res.json(result);
    } catch (error) {
      console.error('Error checking ingredient availability:', error);
      res
        .status(500)
        .json({ error: 'Failed to check ingredient availability' });
    }
  },

  // 将缺货食材添加到购物清单
  async addOutOfStockToShoppingList(req, res) {
    try {
      const { id } = req.params;
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';

      console.log(
        `Processing shopping list add request for mealPlanId ${id} and userId ${userId}`,
      );

      // 从请求体中获取食材数据
      const { ingredients } = req.body;
      console.log('Request body ingredients:', ingredients);

      // 尝试获取膳食计划信息，以便在购物清单中添加更多上下文
      let mealPlanInfo = null;
      try {
        console.log(`Fetching meal plan info for ID: ${id}`);
        const mealPlan = await MealPlanService.getMealPlanById(id);
        if (mealPlan) {
          mealPlanInfo = {
            id: mealPlan._id || mealPlan.id,
            recipeName: mealPlan.recipeId?.name || '未知食谱',
            date: mealPlan.date,
            mealType: mealPlan.mealType,
          };
          console.log('Found meal plan info:', mealPlanInfo);
        } else {
          console.log(`No meal plan found for ID: ${id}`);
        }
      } catch (e) {
        console.warn('Could not get meal plan info:', e.message);
      }

      // 准备要添加到购物清单的食材数组
      let ingredientsToAdd = [];

      if (
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        console.log(
          `No ingredients provided in request, fetching out-of-stock ingredients for meal plan ${id}`,
        );

        // 获取膳食计划的库存状态
        const status = await MealPlanService.checkIngredientAvailability(
          userId,
          id,
        );

        console.log('Ingredient availability check result:', status);

        // 处理完全缺货的食材
        if (
          status?.outOfStock &&
          Array.isArray(status.outOfStock) &&
          status.outOfStock.length > 0
        ) {
          console.log('Found out of stock ingredients:', status.outOfStock);
          ingredientsToAdd.push(...status.outOfStock);
        }

        // 处理库存不足的食材
        if (
          status?.lowStock &&
          Array.isArray(status.lowStock) &&
          status.lowStock.length > 0
        ) {
          console.log('Found low stock ingredients:', status.lowStock);

          // 对于库存不足的食材，只添加缺少的部分数量
          const lowStockToAdd = status.lowStock.map((item) => ({
            name: item.name,
            quantity: item.quantity - (item.availableQuantity || 0), // 计算缺少的数量
            unit: item.unit,
            category: item.category || 'others',
          }));

          // 确保数量大于0
          const validLowStock = lowStockToAdd.filter(
            (item) => item.quantity > 0,
          );
          ingredientsToAdd.push(...validLowStock);
        }
      } else {
        // 使用提供的食材数据
        console.log('Using ingredients provided in request:', ingredients);
        ingredientsToAdd = ingredients;
      }

      // 检查是否有食材需要添加
      if (ingredientsToAdd.length === 0) {
        console.log('No ingredients need to be added to shopping list');
        return res.status(400).json({
          error: 'No ingredients need to be added to shopping list',
          success: false,
        });
      }

      console.log('Adding ingredients to shopping list:', ingredientsToAdd);

      try {
        // 添加到购物清单
        const InventoryService = require('../inventory/inventory.service');
        const addedItems = [];

        for (const ingredient of ingredientsToAdd) {
          try {
            console.log(
              `==== Trying to add ingredient to shopping list: ${ingredient.name} ====`,
            );
            console.log(
              'Ingredient data:',
              JSON.stringify(ingredient, null, 2),
            );

            const item = await InventoryService.addToShoppingList({
              userId,
              name: ingredient.name,
              requiredQuantity: ingredient.quantity,
              toBuyQuantity: ingredient.quantity,
              quantity: ingredient.quantity, // 兼容旧版本
              unit: ingredient.unit,
              category: ingredient.category || 'others',
              // 添加食谱和膳食计划的信息
              mealPlanId: id,
              mealPlanName: mealPlanInfo?.recipeName || '未知食谱',
              mealDate: mealPlanInfo?.date || new Date(),
              mealType: mealPlanInfo?.mealType || '未知',
            });

            console.log(
              `Successfully added item to shopping list: ${ingredient.name}, id: ${item._id}`,
            );
            addedItems.push(item);
          } catch (itemError) {
            console.error(
              `ERROR adding item ${ingredient.name} to shopping list:`,
              itemError.message,
            );
            console.error('Error stack:', itemError.stack);
          }
        }

        return res.status(201).json({
          success: true,
          message: 'Added ingredients to shopping list',
          addedItems,
        });
      } catch (shoppingListError) {
        console.error('Error accessing inventory service:', shoppingListError);
        return res.status(500).json({
          error: `Inventory service error: ${shoppingListError.message}`,
          success: false,
        });
      }
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      return res.status(500).json({
        error: `Failed to add to shopping list: ${error.message}`,
        success: false,
        stack: error.stack,
      });
    }
  },
};

module.exports = MealPlanController;
