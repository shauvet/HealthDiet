const HealthService = require('./health.service');

const HealthController = {
  // 获取所有健康分析数据
  async getAllHealthData(req, res) {
    try {
      const { timeRange, startDate, endDate } = req.query;
      const data = await HealthService.getAllHealthData(
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
      const data = HealthService.getNutrientData();
      res.json(data);
    } catch (error) {
      console.error('Error getting nutrient data:', error);
      res.status(500).json({ error: 'Failed to get nutrient data' });
    }
  },

  // 获取营养摄入趋势数据
  async getNutritionTrends(req, res) {
    try {
      const data = HealthService.getNutritionTrends();
      res.json(data);
    } catch (error) {
      console.error('Error getting nutrition trends:', error);
      res.status(500).json({ error: 'Failed to get nutrition trends' });
    }
  },

  // 获取维生素摄入数据
  async getVitaminIntake(req, res) {
    try {
      const data = HealthService.getVitaminIntake();
      res.json(data);
    } catch (error) {
      console.error('Error getting vitamin intake:', error);
      res.status(500).json({ error: 'Failed to get vitamin intake' });
    }
  },

  // 获取矿物质摄入数据
  async getMineralIntake(req, res) {
    try {
      const data = HealthService.getMineralIntake();
      res.json(data);
    } catch (error) {
      console.error('Error getting mineral intake:', error);
      res.status(500).json({ error: 'Failed to get mineral intake' });
    }
  },

  // 获取饮食结构数据
  async getDietStructure(req, res) {
    try {
      const data = HealthService.getDietStructure();
      res.json(data);
    } catch (error) {
      console.error('Error getting diet structure:', error);
      res.status(500).json({ error: 'Failed to get diet structure' });
    }
  },
};

module.exports = HealthController;
