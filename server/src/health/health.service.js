const HealthRepository = require('./repositories/health.repository');

const HealthService = {
  // 获取日均营养摄入数据
  async getNutrientData(userId) {
    return await HealthRepository.getAverageNutrition(userId);
  },

  // 获取饮食结构数据
  async getDietStructure(userId) {
    return await HealthRepository.getDietStructure(userId);
  },

  // 获取营养摄入趋势数据
  async getNutritionTrends(userId, days = 7) {
    return await HealthRepository.getNutritionTrends(userId, days);
  },

  // 获取维生素摄入数据
  async getVitaminIntake(userId) {
    // 获取最新的营养数据
    const latestNutrition = await HealthRepository.getLatestNutrition(userId);

    // 获取营养目标
    const goals = await HealthRepository.getNutritionGoals(userId);

    // 如果没有营养数据，返回营养目标的默认值
    if (
      !latestNutrition ||
      !latestNutrition.vitamins ||
      latestNutrition.vitamins.length === 0
    ) {
      return goals.vitaminGoals.map((vitamin) => ({
        name: vitamin.name,
        current: 0,
        recommended: vitamin.amount,
        unit: vitamin.unit,
      }));
    }

    // 合并最新数据和目标
    return goals.vitaminGoals.map((goal) => {
      const current = latestNutrition.vitamins.find(
        (v) => v.name === goal.name,
      );
      return {
        name: goal.name,
        current: current ? current.amount : 0,
        recommended: goal.amount,
        unit: goal.unit,
      };
    });
  },

  // 获取矿物质摄入数据
  async getMineralIntake(userId) {
    // 获取最新的营养数据
    const latestNutrition = await HealthRepository.getLatestNutrition(userId);

    // 获取营养目标
    const goals = await HealthRepository.getNutritionGoals(userId);

    // 如果没有营养数据，返回营养目标的默认值
    if (
      !latestNutrition ||
      !latestNutrition.minerals ||
      latestNutrition.minerals.length === 0
    ) {
      return goals.mineralGoals.map((mineral) => ({
        name: mineral.name,
        current: 0,
        recommended: mineral.amount,
        unit: mineral.unit,
      }));
    }

    // 合并最新数据和目标
    return goals.mineralGoals.map((goal) => {
      const current = latestNutrition.minerals.find(
        (m) => m.name === goal.name,
      );
      return {
        name: goal.name,
        current: current ? current.amount : 0,
        recommended: goal.amount,
        unit: goal.unit,
      };
    });
  },

  // 获取食材使用频率数据 - 这将需要从膳食计划和食谱中统计
  async getIngredientUsage(userId, days = 30) {
    // 这个方法需要与膳食计划和食谱数据关联
    // 暂时保留静态数据，后续实现
    return [
      {
        category: '蔬菜',
        items: [
          { name: '西红柿', frequency: 12 },
          { name: '青椒', frequency: 8 },
          { name: '胡萝卜', frequency: 7 },
          { name: '白菜', frequency: 6 },
          { name: '菠菜', frequency: 5 },
        ],
      },
      {
        category: '肉类',
        items: [
          { name: '猪肉', frequency: 8 },
          { name: '鸡肉', frequency: 6 },
          { name: '牛肉', frequency: 4 },
          { name: '鱼', frequency: 3 },
        ],
      },
      {
        category: '主食',
        items: [
          { name: '大米', frequency: 14 },
          { name: '面条', frequency: 6 },
          { name: '馒头', frequency: 4 },
        ],
      },
    ];
  },

  // 获取营养建议数据 - 这可以基于用户的实际摄入和目标进行计算
  async getNutritionAdvice(userId) {
    // 获取用户的平均营养摄入
    const averageNutrition = await HealthRepository.getAverageNutrition(userId);

    // 获取用户的营养目标
    const goals = await HealthRepository.getNutritionGoals(userId);

    // 根据实际摄入和目标的差距生成建议
    const findings = [];
    const suggestions = [];

    // 检查蛋白质
    const proteinPercentage =
      (averageNutrition.protein.value / goals.proteinGoal) * 100;
    if (proteinPercentage >= 90 && proteinPercentage <= 110) {
      findings.push('蛋白质摄入接近推荐值，继续保持');
    } else if (proteinPercentage < 90) {
      findings.push('蛋白质摄入不足，建议增加');
      suggestions.push('增加瘦肉、鱼类、豆类等优质蛋白的摄入');
    } else {
      findings.push('蛋白质摄入偏高，可适当减少');
    }

    // 检查膳食纤维
    const fiberPercentage =
      (averageNutrition.fiber.value / goals.fiberGoal) * 100;
    if (fiberPercentage < 80) {
      findings.push('膳食纤维摄入偏低，建议增加全谷物和蔬菜的摄入');
      suggestions.push('选择全谷物替代精制谷物');
      suggestions.push('增加深色蔬菜的摄入，如菠菜、西兰花等');
    }

    // 检查脂肪
    const fatPercentage = (averageNutrition.fat.value / goals.fatGoal) * 100;
    if (fatPercentage > 110) {
      findings.push('脂肪摄入略高，可以适当控制');
      suggestions.push('控制油炸食品的摄入频率');
      suggestions.push('选择低脂烹饪方式，如蒸、煮、炖等');
    }

    // 添加基本建议
    if (suggestions.length === 0) {
      suggestions.push('增加饮食多样性，摄入更多种类的食物');
      suggestions.push('保持规律用餐，避免过度进食');
      suggestions.push('增加水果和蔬菜的摄入量');
    }

    return [
      {
        category: '主要发现',
        items: findings.length > 0 ? findings : ['您的饮食总体较为均衡'],
      },
      {
        category: '改进建议',
        items: suggestions,
      },
    ];
  },

  // 获取食材多样性分析数据
  async getIngredientDiversity(userId) {
    // 暂时保留静态数据，后续实现与食谱和库存的关联计算
    return {
      vegetables: { count: 15, target: 20, description: '蔬菜品类' },
      fruits: { count: 8, target: 10, description: '水果品类' },
      proteins: { count: 6, target: 8, description: '蛋白质来源' },
      grains: { count: 4, target: 5, description: '谷物类' },
    };
  },

  // 获取所有健康分析数据
  async getAllHealthData(userId, timeRange = 'week', startDate, endDate) {
    return {
      nutrientData: await this.getNutrientData(userId),
      dietStructure: await this.getDietStructure(userId),
      nutritionTrends: await this.getNutritionTrends(
        userId,
        timeRange === 'week' ? 7 : 30,
      ),
      vitaminIntake: await this.getVitaminIntake(userId),
      mineralIntake: await this.getMineralIntake(userId),
      ingredientUsage: await this.getIngredientUsage(userId),
      nutritionAdvice: await this.getNutritionAdvice(userId),
      ingredientDiversity: await this.getIngredientDiversity(userId),
    };
  },

  // 添加或更新用户的营养目标
  async updateNutritionGoals(userId, goalsData) {
    return await HealthRepository.updateNutritionGoals(userId, goalsData);
  },

  // 添加每日营养数据
  async addDailyNutrition(nutritionData) {
    return await HealthRepository.addOrUpdateDailyNutrition(nutritionData);
  },
};

module.exports = HealthService;
