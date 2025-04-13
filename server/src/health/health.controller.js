const HealthService = require('./health.service');

const HealthController = {
  // 获取所有健康分析数据
  async getAllHealthData(req, res) {
    try {
      const { timeRange, startDate, endDate } = req.query;
      // 从请求中获取用户ID，实际项目中应从认证中间件获取
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getAllHealthData(
        userId,
        timeRange,
        startDate,
        endDate,
      );
      res.json(data);
    } catch (error) {
      console.error('Error getting health data:', error);
      res.status(500).json({ error: 'Failed to get health data' });
    }
  },

  // 获取日均营养摄入数据
  async getNutrientData(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getNutrientData(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting nutrient data:', error);
      res.status(500).json({ error: 'Failed to get nutrient data' });
    }
  },

  // 获取营养摄入趋势数据
  async getNutritionTrends(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const { days } = req.query;

      const data = await HealthService.getNutritionTrends(
        userId,
        days ? parseInt(days) : 7,
      );
      res.json(data);
    } catch (error) {
      console.error('Error getting nutrition trends:', error);
      res.status(500).json({ error: 'Failed to get nutrition trends' });
    }
  },

  // 获取维生素摄入数据
  async getVitaminIntake(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getVitaminIntake(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting vitamin intake:', error);
      res.status(500).json({ error: 'Failed to get vitamin intake' });
    }
  },

  // 获取矿物质摄入数据
  async getMineralIntake(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getMineralIntake(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting mineral intake:', error);
      res.status(500).json({ error: 'Failed to get mineral intake' });
    }
  },

  // 获取饮食结构数据
  async getDietStructure(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getDietStructure(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting diet structure:', error);
      res.status(500).json({ error: 'Failed to get diet structure' });
    }
  },

  // 更新营养目标
  async updateNutritionGoals(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const goalsData = req.body;

      const updatedGoals = await HealthService.updateNutritionGoals(
        userId,
        goalsData,
      );
      res.json(updatedGoals);
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
      res.status(500).json({ error: 'Failed to update nutrition goals' });
    }
  },

  // 添加每日营养数据
  async addDailyNutrition(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const nutritionData = { ...req.body, userId };

      const savedData = await HealthService.addDailyNutrition(nutritionData);
      res.json(savedData);
    } catch (error) {
      console.error('Error adding daily nutrition:', error);
      res.status(500).json({ error: 'Failed to add daily nutrition' });
    }
  },

  // 获取已点菜单营养数据
  async getMealPlanNutritionData(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const data = await HealthService.getMealPlanNutritionData(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting meal plan nutrition data:', error);
      res.status(500).json({ error: 'Failed to get meal plan nutrition data' });
    }
  },

  // 测试TianAPI调用
  async testTianApi(req, res) {
    try {
      const { foodName } = req.query;

      if (!foodName) {
        return res.status(400).json({ error: '缺少食物名称参数' });
      }

      console.log(`测试TianAPI调用，食物名称: ${foodName}`);
      const data = await HealthService.fetchFoodNutrition(foodName);
      res.json({ success: true, data });
    } catch (error) {
      console.error('测试TianAPI调用出错:', error);
      res
        .status(500)
        .json({ error: '测试TianAPI调用失败', message: error.message });
    }
  },
};

module.exports = HealthController;
