const mongoose = require('mongoose');
const { MealPlanSchema } = require('../schemas/meal-plan.schema');

// 创建模型
const MealPlan = mongoose.model('MealPlan', MealPlanSchema);

class MealPlanRepository {
  // 获取用户指定日期范围内的膳食计划
  async getUserMealPlans(userId, startDate, endDate) {
    return await MealPlan.find({
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate('recipeId')
      .sort({ date: 1, mealType: 1 })
      .exec();
  }

  // 获取用户指定日期的膳食计划
  async getDailyMealPlan(userId, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return await MealPlan.find({
      userId,
      date: { $gte: dayStart, $lte: dayEnd },
    })
      .populate('recipeId')
      .sort({ mealType: 1 })
      .exec();
  }

  // 添加膳食计划
  async addMealPlan(mealPlanData) {
    const mealPlan = new MealPlan(mealPlanData);
    return await mealPlan.save();
  }

  // 获取单个膳食计划详情
  async getMealPlanById(id) {
    return await MealPlan.findById(id)
      .populate('recipeId')
      .populate('forFamilyMembers')
      .exec();
  }

  // 更新膳食计划
  async updateMealPlan(id, updateData) {
    return await MealPlan.findByIdAndUpdate(id, updateData, { new: true });
  }

  // 删除膳食计划
  async removeMealPlan(id) {
    return await MealPlan.findByIdAndDelete(id);
  }

  // 批量添加膳食计划（批量生成计划）
  async bulkAddMealPlans(mealPlansData) {
    return await MealPlan.insertMany(mealPlansData);
  }

  // 标记膳食计划为已完成
  async markAsCompleted(id, completed = true) {
    return await MealPlan.findByIdAndUpdate(id, { completed }, { new: true });
  }

  // 获取用户最常制作的菜谱
  async getMostFrequentRecipes(userId, limit = 5) {
    return await MealPlan.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$recipeId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'recipes',
          localField: '_id',
          foreignField: '_id',
          as: 'recipe',
        },
      },
      { $unwind: '$recipe' },
      {
        $project: {
          _id: 0,
          id: '$recipe._id',
          name: '$recipe.name',
          count: 1,
        },
      },
    ]);
  }

  // 获取用户各餐类型的膳食计划分布
  async getMealTypeDistribution(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const mealTypeCounts = await MealPlan.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
        },
      },
    ]);

    // 转换为所需格式
    const result = {};
    mealTypeCounts.forEach((item) => {
      result[item._id] = item.count;
    });

    // 确保所有餐类型都有值
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    mealTypes.forEach((type) => {
      if (!result[type]) {
        result[type] = 0;
      }
    });

    return result;
  }
}

module.exports = new MealPlanRepository();
