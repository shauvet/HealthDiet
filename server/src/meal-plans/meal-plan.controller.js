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
};

module.exports = MealPlanController;
