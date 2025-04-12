const mongoose = require('mongoose');
const {
  DailyNutritionSchema,
  NutritionGoalSchema,
} = require('../schemas/health.schema');

// 创建模型
const DailyNutrition = mongoose.model('DailyNutrition', DailyNutritionSchema);
const NutritionGoal = mongoose.model('NutritionGoal', NutritionGoalSchema);

class HealthRepository {
  // 获取指定日期范围内的营养数据
  async getNutritionByDateRange(userId, startDate, endDate) {
    return await DailyNutrition.find({
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).sort({ date: 1 });
  }

  // 获取用户最新的营养数据
  async getLatestNutrition(userId) {
    return await DailyNutrition.findOne({ userId }).sort({ date: -1 }).exec();
  }

  // 获取用户的营养目标
  async getNutritionGoals(userId) {
    let goals = await NutritionGoal.findOne({ userId });

    // 如果用户没有设置营养目标，则创建默认目标
    if (!goals) {
      goals = await this.createDefaultNutritionGoals(userId);
    }

    return goals;
  }

  // 创建默认的营养目标
  async createDefaultNutritionGoals(userId) {
    const defaultGoals = new NutritionGoal({
      userId,
      caloriesGoal: 2000,
      proteinGoal: 80,
      fatGoal: 70,
      carbsGoal: 250,
      fiberGoal: 30,
      vitaminGoals: [
        { name: '维生素A', amount: 1000, unit: 'μg' },
        { name: '维生素B1', amount: 1.4, unit: 'mg' },
        { name: '维生素B2', amount: 1.4, unit: 'mg' },
        { name: '维生素C', amount: 100, unit: 'mg' },
        { name: '维生素D', amount: 10, unit: 'μg' },
        { name: '维生素E', amount: 14, unit: 'mg' },
      ],
      mineralGoals: [
        { name: '钙', amount: 1000, unit: 'mg' },
        { name: '铁', amount: 15, unit: 'mg' },
        { name: '锌', amount: 12, unit: 'mg' },
        { name: '钾', amount: 2500, unit: 'mg' },
        { name: '镁', amount: 350, unit: 'mg' },
        { name: '硒', amount: 50, unit: 'μg' },
      ],
      dietStructureGoal: {
        grains: 25,
        vegetables: 35,
        fruits: 15,
        protein: 20,
        dairy: 15,
        fats: 10,
      },
    });

    return await defaultGoals.save();
  }

  // 更新用户的营养目标
  async updateNutritionGoals(userId, updateData) {
    return await NutritionGoal.findOneAndUpdate({ userId }, updateData, {
      new: true,
      upsert: true,
    });
  }

  // 添加或更新每日营养数据
  async addOrUpdateDailyNutrition(nutritionData) {
    const { userId, date } = nutritionData;

    // 查找当天是否已有记录
    const existingRecord = await DailyNutrition.findOne({
      userId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999),
      },
    });

    if (existingRecord) {
      // 更新现有记录
      return await DailyNutrition.findByIdAndUpdate(
        existingRecord._id,
        nutritionData,
        { new: true },
      );
    } else {
      // 创建新记录
      const newNutrition = new DailyNutrition(nutritionData);
      return await newNutrition.save();
    }
  }

  // 获取用户的营养趋势数据
  async getNutritionTrends(userId, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    // 设置日期范围从开始日期的0点到结束日期的23:59:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const nutritionData = await DailyNutrition.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // 格式化数据为趋势图所需格式
    const dates = [];
    const data = {
      calories: [],
      protein: [],
      fat: [],
      carbs: [],
      fiber: [],
    };

    // 创建日期数组
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toLocaleDateString().slice(5)); // 格式为 "MM-DD"
    }

    // 对每一天填充数据
    dates.forEach((dateStr, index) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + index);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      // 查找当天的营养数据
      const dayData = nutritionData.find((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= day && itemDate < nextDay;
      });

      if (dayData) {
        data.calories.push(dayData.calories);
        data.protein.push(dayData.protein);
        data.fat.push(dayData.fat);
        data.carbs.push(dayData.carbs);
        data.fiber.push(dayData.fiber);
      } else {
        // 如果没有数据，填充0
        data.calories.push(0);
        data.protein.push(0);
        data.fat.push(0);
        data.carbs.push(0);
        data.fiber.push(0);
      }
    });

    return { dates, data };
  }

  // 获取用户的日均营养数据
  async getAverageNutrition(userId, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    // 设置日期范围从开始日期的0点到结束日期的23:59:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const nutritionData = await DailyNutrition.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (nutritionData.length === 0) {
      return {
        calories: { value: 0, max: 2000, unit: 'kcal', color: 'warning.main' },
        protein: { value: 0, max: 80, unit: 'g', color: 'success.main' },
        fat: { value: 0, max: 70, unit: 'g', color: 'error.main' },
        carbs: { value: 0, max: 250, unit: 'g', color: 'info.main' },
        fiber: { value: 0, max: 30, unit: 'g', color: 'secondary.main' },
      };
    }

    // 计算平均值
    const sumCalories = nutritionData.reduce(
      (sum, item) => sum + item.calories,
      0,
    );
    const sumProtein = nutritionData.reduce(
      (sum, item) => sum + item.protein,
      0,
    );
    const sumFat = nutritionData.reduce((sum, item) => sum + item.fat, 0);
    const sumCarbs = nutritionData.reduce((sum, item) => sum + item.carbs, 0);
    const sumFiber = nutritionData.reduce((sum, item) => sum + item.fiber, 0);

    // 获取用户的营养目标
    const goals = await this.getNutritionGoals(userId);

    return {
      calories: {
        value: Math.round(sumCalories / nutritionData.length),
        max: goals.caloriesGoal || 2000,
        unit: 'kcal',
        color: 'warning.main',
      },
      protein: {
        value: Math.round(sumProtein / nutritionData.length),
        max: goals.proteinGoal || 80,
        unit: 'g',
        color: 'success.main',
      },
      fat: {
        value: Math.round(sumFat / nutritionData.length),
        max: goals.fatGoal || 70,
        unit: 'g',
        color: 'error.main',
      },
      carbs: {
        value: Math.round(sumCarbs / nutritionData.length),
        max: goals.carbsGoal || 250,
        unit: 'g',
        color: 'info.main',
      },
      fiber: {
        value: Math.round(sumFiber / nutritionData.length),
        max: goals.fiberGoal || 30,
        unit: 'g',
        color: 'secondary.main',
      },
    };
  }

  // 获取用户的饮食结构数据
  async getDietStructure(userId, days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    // 设置日期范围从开始日期的0点到结束日期的23:59:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const nutritionData = await DailyNutrition.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (nutritionData.length === 0) {
      return {
        grains: { value: 0, recommended: 25, unit: '%' },
        vegetables: { value: 0, recommended: 35, unit: '%' },
        fruits: { value: 0, recommended: 15, unit: '%' },
        protein: { value: 0, recommended: 20, unit: '%' },
        dairy: { value: 0, recommended: 15, unit: '%' },
        fats: { value: 0, recommended: 10, unit: '%' },
      };
    }

    // 计算平均值
    let sumGrains = 0,
      sumVegetables = 0,
      sumFruits = 0;
    let sumProtein = 0,
      sumDairy = 0,
      sumFats = 0;

    nutritionData.forEach((item) => {
      if (item.dietStructure) {
        sumGrains += item.dietStructure.grains || 0;
        sumVegetables += item.dietStructure.vegetables || 0;
        sumFruits += item.dietStructure.fruits || 0;
        sumProtein += item.dietStructure.protein || 0;
        sumDairy += item.dietStructure.dairy || 0;
        sumFats += item.dietStructure.fats || 0;
      }
    });

    // 获取用户的营养目标
    const goals = await this.getNutritionGoals(userId);

    return {
      grains: {
        value: Math.round(sumGrains / nutritionData.length),
        recommended: goals.dietStructureGoal?.grains || 25,
        unit: '%',
      },
      vegetables: {
        value: Math.round(sumVegetables / nutritionData.length),
        recommended: goals.dietStructureGoal?.vegetables || 35,
        unit: '%',
      },
      fruits: {
        value: Math.round(sumFruits / nutritionData.length),
        recommended: goals.dietStructureGoal?.fruits || 15,
        unit: '%',
      },
      protein: {
        value: Math.round(sumProtein / nutritionData.length),
        recommended: goals.dietStructureGoal?.protein || 20,
        unit: '%',
      },
      dairy: {
        value: Math.round(sumDairy / nutritionData.length),
        recommended: goals.dietStructureGoal?.dairy || 15,
        unit: '%',
      },
      fats: {
        value: Math.round(sumFats / nutritionData.length),
        recommended: goals.dietStructureGoal?.fats || 10,
        unit: '%',
      },
    };
  }
}

module.exports = new HealthRepository();
