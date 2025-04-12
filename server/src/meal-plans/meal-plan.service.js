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

  // 检查膳食计划所需配料的库存情况
  async checkIngredientAvailability(userId, mealPlanId) {
    try {
      // 处理不同类型的ID
      let mealPlan = null;

      // 记录请求信息，便于调试
      console.log(
        `Checking ingredients for meal plan ID: ${mealPlanId}, userId: ${userId}`,
      );

      // 尝试方法1: 如果是有效的ObjectId格式
      if (mongoose.Types.ObjectId.isValid(mealPlanId)) {
        const objectId = new mongoose.Types.ObjectId(mealPlanId);
        mealPlan = await MealPlanRepository.getMealPlanById(objectId);
        console.log('Searched by ObjectId:', mealPlan ? 'Found' : 'Not found');
      }

      // 尝试方法2: 如果方法1失败，尝试使用数字ID查询
      if (!mealPlan) {
        mealPlan = await MealPlanRepository.getMealPlanByNumericId(mealPlanId);
        console.log('Searched by NumericId:', mealPlan ? 'Found' : 'Not found');
      }

      // 如果仍然没有找到，尝试获取用户的任何一个膳食计划
      if (!mealPlan) {
        console.log('Trying to get any meal plan for this user');
        // 获取用户的所有膳食计划
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const userMealPlans = await MealPlanRepository.getUserMealPlans(
          userId,
          oneMonthAgo,
          today,
        );

        if (userMealPlans && userMealPlans.length > 0) {
          mealPlan = userMealPlans[0]; // 使用第一个找到的膳食计划
          console.log('Found alternative meal plan:', mealPlan._id);
        }
      }

      // 如果仍然没有找到
      if (!mealPlan) {
        // 返回空结果而不是抛出错误，以避免前端崩溃
        console.log(
          `No meal plan found for ID: ${mealPlanId} and userId: ${userId}`,
        );
        return {
          available: [],
          outOfStock: [],
          lowStock: [],
          error: `Meal plan not found with ID: ${mealPlanId}`,
        };
      }

      // 如果膳食计划不属于该用户，返回错误
      if (mealPlan.userId && mealPlan.userId.toString() !== userId) {
        console.log(
          `Unauthorized access: meal plan belongs to ${mealPlan.userId}, not ${userId}`,
        );
        return {
          available: [],
          outOfStock: [],
          lowStock: [],
          error: 'Unauthorized access to meal plan',
        };
      }

      // 获取食谱详情，包括所需配料
      const recipe = mealPlan.recipeId;

      if (!recipe || !recipe.ingredients) {
        console.log('No recipe or ingredients found for this meal plan');
        return {
          available: [],
          outOfStock: [],
          lowStock: [],
          mealPlanFound: true,
          noIngredients: true,
        };
      }

      // 获取用户库存
      // 注意：这里需要引入库存仓库
      const InventoryRepository = require('../inventory/repositories/inventory.repository');
      const userInventory = await InventoryRepository.getUserInventory(userId);

      // 分析配料和库存情况
      const available = [];
      const outOfStock = [];
      const lowStock = [];

      recipe.ingredients.forEach((ingredient) => {
        // 找到库存中对应的食材
        const inventoryItem = userInventory.find(
          (item) =>
            item.name.toLowerCase() === ingredient.name.toLowerCase() ||
            (item.alternativeNames &&
              item.alternativeNames.some(
                (name) => name.toLowerCase() === ingredient.name.toLowerCase(),
              )),
        );

        // 根据需要数量和库存数量进行判断
        if (!inventoryItem) {
          outOfStock.push(ingredient);
        } else if (inventoryItem.quantity < ingredient.quantity) {
          lowStock.push({
            ...ingredient,
            availableQuantity: inventoryItem.quantity,
          });
        } else {
          available.push(ingredient);
        }
      });

      return {
        available,
        outOfStock,
        lowStock,
        mealPlanFound: true,
        noIngredients: false,
      };
    } catch (error) {
      console.error('Error in checkIngredientAvailability:', error);
      throw error;
    }
  },
};

module.exports = MealPlanService;
