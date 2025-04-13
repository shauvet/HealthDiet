const MealPlanService = require('./meal-plan.service');

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
      res.json(mealPlans);
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
      res.json(mealPlans);
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

      res.json(mealPlan);
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

      const mealPlans = await MealPlanService.getCurrentWeekMealPlans(userId);
      res.json(mealPlans);
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

      // 如果没有提供食材数据，尝试获取缺货食材
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

        // 检查是否成功获取了缺货食材
        if (
          !status ||
          !status.outOfStock ||
          !Array.isArray(status.outOfStock) ||
          status.outOfStock.length === 0
        ) {
          console.log('No out-of-stock ingredients found');
          return res.status(400).json({
            error: 'No out of stock ingredients found',
            success: false,
          });
        }

        // 使用获取到的缺货食材
        const { outOfStock } = status;
        console.log(
          'Adding out of stock ingredients to shopping list:',
          outOfStock,
        );

        try {
          // 添加到购物清单
          const InventoryService = require('../inventory/inventory.service');
          const addedItems = [];

          for (const ingredient of outOfStock) {
            try {
              const item = await InventoryService.addToShoppingList({
                userId,
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                category: ingredient.category || 'others',
                // 添加食谱和膳食计划的信息
                mealPlanId: id,
                mealPlanName: mealPlanInfo?.recipeName || '未知食谱',
                mealDate: mealPlanInfo?.date || new Date(),
                mealType: mealPlanInfo?.mealType || '未知',
              });

              console.log(`Added item to shopping list: ${ingredient.name}`);
              addedItems.push(item);
            } catch (itemError) {
              console.error(
                `Error adding item ${ingredient.name} to shopping list:`,
                itemError,
              );
            }
          }

          return res.status(201).json({
            success: true,
            message: 'Added out of stock ingredients to shopping list',
            addedItems,
          });
        } catch (shoppingListError) {
          console.error(
            'Error accessing inventory service:',
            shoppingListError,
          );
          return res.status(500).json({
            error: `Inventory service error: ${shoppingListError.message}`,
            success: false,
          });
        }
      } else {
        // 使用提供的食材数据
        console.log('Using ingredients provided in request:', ingredients);

        try {
          const InventoryService = require('../inventory/inventory.service');
          const addedItems = [];

          for (const ingredient of ingredients) {
            try {
              const item = await InventoryService.addToShoppingList({
                userId,
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                category: ingredient.category || 'others',
                // 添加食谱和膳食计划的信息
                mealPlanId: id,
                mealPlanName: mealPlanInfo?.recipeName || '未知食谱',
                mealDate: mealPlanInfo?.date || new Date(),
                mealType: mealPlanInfo?.mealType || '未知',
              });

              console.log(`Added item to shopping list: ${ingredient.name}`);
              addedItems.push(item);
            } catch (itemError) {
              console.error(
                `Error adding item ${ingredient.name} to shopping list:`,
                itemError,
              );
            }
          }

          return res.status(201).json({
            success: true,
            message: 'Added ingredients to shopping list',
            addedItems,
          });
        } catch (shoppingListError) {
          console.error(
            'Error accessing inventory service:',
            shoppingListError,
          );
          return res.status(500).json({
            error: `Inventory service error: ${shoppingListError.message}`,
            success: false,
          });
        }
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
