const HealthService = {
  // 获取日均营养摄入数据
  getNutrientData() {
    return {
      calories: { value: 1850, max: 2000, unit: 'kcal', color: 'warning.main' },
      protein: { value: 75, max: 80, unit: 'g', color: 'success.main' },
      fat: { value: 65, max: 70, unit: 'g', color: 'error.main' },
      carbs: { value: 220, max: 250, unit: 'g', color: 'info.main' },
      fiber: { value: 22, max: 30, unit: 'g', color: 'secondary.main' },
    };
  },

  // 获取饮食结构数据
  getDietStructure() {
    return {
      grains: { value: 30, recommended: 25, unit: '%' },
      vegetables: { value: 20, recommended: 35, unit: '%' },
      fruits: { value: 10, recommended: 15, unit: '%' },
      protein: { value: 25, recommended: 20, unit: '%' },
      dairy: { value: 10, recommended: 15, unit: '%' },
      fats: { value: 15, recommended: 10, unit: '%' },
    };
  },

  // 获取营养摄入趋势数据
  getNutritionTrends() {
    return {
      dates: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7'],
      data: {
        calories: [1800, 2100, 1950, 1850, 2000, 1900, 1850],
        protein: [70, 85, 75, 72, 80, 78, 75],
        fat: [60, 75, 68, 65, 70, 67, 65],
        carbs: [210, 240, 225, 220, 230, 225, 220],
        fiber: [20, 25, 22, 21, 24, 23, 22],
      },
    };
  },

  // 获取维生素摄入数据
  getVitaminIntake() {
    return [
      { name: '维生素A', current: 800, recommended: 1000, unit: 'μg' },
      { name: '维生素B1', current: 1.2, recommended: 1.4, unit: 'mg' },
      { name: '维生素B2', current: 1.3, recommended: 1.4, unit: 'mg' },
      { name: '维生素C', current: 85, recommended: 100, unit: 'mg' },
      { name: '维生素D', current: 8, recommended: 10, unit: 'μg' },
      { name: '维生素E', current: 12, recommended: 14, unit: 'mg' },
    ];
  },

  // 获取矿物质摄入数据
  getMineralIntake() {
    return [
      { name: '钙', current: 800, recommended: 1000, unit: 'mg' },
      { name: '铁', current: 12, recommended: 15, unit: 'mg' },
      { name: '锌', current: 11, recommended: 12, unit: 'mg' },
      { name: '钾', current: 2000, recommended: 2500, unit: 'mg' },
      { name: '镁', current: 320, recommended: 350, unit: 'mg' },
      { name: '硒', current: 45, recommended: 50, unit: 'μg' },
    ];
  },

  // 获取食材使用频率数据
  getIngredientUsage() {
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

  // 获取营养建议数据
  getNutritionAdvice() {
    return [
      {
        category: '主要发现',
        items: [
          '蛋白质摄入接近推荐值，继续保持',
          '膳食纤维摄入偏低，建议增加全谷物和蔬菜的摄入',
          '脂肪摄入略高，可以适当控制',
        ],
      },
      {
        category: '改进建议',
        items: [
          '增加深色蔬菜的摄入，如菠菜、西兰花等',
          '选择全谷物替代精制谷物',
          '增加豆类和鱼类的食用频率',
          '控制油炸食品的摄入频率',
        ],
      },
    ];
  },

  // 获取食材多样性分析数据
  getIngredientDiversity() {
    return {
      vegetables: { count: 15, target: 20, description: '蔬菜品类' },
      fruits: { count: 8, target: 10, description: '水果品类' },
      proteins: { count: 6, target: 8, description: '蛋白质来源' },
      grains: { count: 4, target: 5, description: '谷物类' },
    };
  },

  // 获取所有健康分析数据
  async getAllHealthData(timeRange, startDate, endDate) {
    return {
      nutrientData: this.getNutrientData(),
      dietStructure: this.getDietStructure(),
      nutritionTrends: this.getNutritionTrends(),
      vitaminIntake: this.getVitaminIntake(),
      mineralIntake: this.getMineralIntake(),
      ingredientUsage: this.getIngredientUsage(),
      nutritionAdvice: this.getNutritionAdvice(),
      ingredientDiversity: this.getIngredientDiversity(),
    };
  },
};

module.exports = HealthService;
