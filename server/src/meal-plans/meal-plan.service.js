const MealPlanRepository = require('./repositories/meal-plan.repository');
const mongoose = require('mongoose');

const MealPlanService = {
  // 获取用户指定日期范围内的膳食计划
  async getUserMealPlans(userId, startDate, endDate) {
    return await MealPlanRepository.getUserMealPlans(
      userId,
      startDate,
      endDate,
    );
  },

  // 获取用户指定日期的膳食计划
  async getDailyMealPlan(userId, date) {
    return await MealPlanRepository.getDailyMealPlan(userId, date);
  },

  // 添加膳食计划
  async addMealPlan(mealPlanData) {
    return await MealPlanRepository.addMealPlan(mealPlanData);
  },

  // 获取单个膳食计划详情
  async getMealPlanById(id) {
    return await MealPlanRepository.getMealPlanById(id);
  },

  // 更新膳食计划
  async updateMealPlan(id, updateData) {
    return await MealPlanRepository.updateMealPlan(id, updateData);
  },

  // 删除膳食计划
  async removeMealPlan(id) {
    return await MealPlanRepository.removeMealPlan(id);
  },

  // 批量生成膳食计划
  async generateMealPlans(userId, startDate, endDate, preferences = {}) {
    // 这个功能的逻辑比较复杂，需要选择合适的食谱，生成计划
    // 暂时简单实现
    const mealPlans = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    // 获取所有可用的食谱ID，实际项目中应该从食谱服务获取
    // 暂时使用简单的模拟数据
    const availableRecipeIds = [
      new mongoose.Types.ObjectId(), // 早餐食谱
      new mongoose.Types.ObjectId(), // 午餐食谱
      new mongoose.Types.ObjectId(), // 晚餐食谱
    ];

    // 生成从起始日期到结束日期的每一天的三餐计划
    while (currentDate <= end) {
      // 生成早餐计划
      mealPlans.push({
        userId,
        date: new Date(currentDate),
        mealType: 'breakfast',
        recipeId: availableRecipeIds[0],
        servings: preferences.breakfast?.servings || 1,
      });

      // 生成午餐计划
      mealPlans.push({
        userId,
        date: new Date(currentDate),
        mealType: 'lunch',
        recipeId: availableRecipeIds[1],
        servings: preferences.lunch?.servings || 1,
      });

      // 生成晚餐计划
      mealPlans.push({
        userId,
        date: new Date(currentDate),
        mealType: 'dinner',
        recipeId: availableRecipeIds[2],
        servings: preferences.dinner?.servings || 1,
      });

      // 前进一天
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 批量添加所有生成的计划
    return await MealPlanRepository.bulkAddMealPlans(mealPlans);
  },

  // 标记膳食计划为已完成
  async markAsCompleted(id, completed = true) {
    return await MealPlanRepository.markAsCompleted(id, completed);
  },

  // 获取用户最常制作的菜谱
  async getMostFrequentRecipes(userId, limit = 5) {
    return await MealPlanRepository.getMostFrequentRecipes(userId, limit);
  },

  // 获取用户各餐类型的膳食计划分布
  async getMealTypeDistribution(userId, days = 30) {
    return await MealPlanRepository.getMealTypeDistribution(userId, days);
  },

  // 获取用户当前周的膳食计划
  async getCurrentWeekMealPlans(userId) {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = 周日, 1 = 周一, ...

    // 将日期设置为本周的周一
    startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // 计算本周的周日
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return await this.getUserMealPlans(userId, startOfWeek, endOfWeek);
  },
};

module.exports = MealPlanService;
