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
  async getIngredientUsage(userId) {
    // 这个方法需要与膳食计划和食谱数据关联，后续将使用 userId 参数
    console.log(`Fetching ingredient usage for user: ${userId}`);

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
  async getIngredientDiversity() {
    // 暂时保留静态数据，后续实现与食谱和库存的关联计算
    return {
      vegetables: { count: 15, target: 20, description: '蔬菜品类' },
      fruits: { count: 8, target: 10, description: '水果品类' },
      proteins: { count: 6, target: 8, description: '蛋白质来源' },
      grains: { count: 4, target: 5, description: '谷物类' },
    };
  },

  // 从tianapi获取食物营养成分数据
  async fetchFoodNutrition(foodName) {
    try {
      console.log(`Fetching nutrition data from TianAPI for: ${foodName}`);
      const axios = require('axios');

      // 使用axios替代request库
      console.log('Making TianAPI request...');
      const apiKey =
        process.env.TIANAPI_KEY || 'a8c6c159ae4ce574c8fa398d3ebd5d88';
      console.log(`Using API key: ${apiKey}`);

      const params = new URLSearchParams();
      params.append('key', apiKey);
      params.append('word', foodName);
      params.append('mode', 0); // 0: 返回营养成分, 1: 食品分类

      // 打印请求详情
      console.log(`Request URL: https://apis.tianapi.com/nutrient/index`);
      console.log(`Request params:`, params.toString());

      const response = await axios.post(
        'https://apis.tianapi.com/nutrient/index',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(
        `TianAPI raw response for ${foodName}:`,
        JSON.stringify(response.data),
      );

      if (response.data.code !== 200) {
        console.error(
          `TianAPI returned error for ${foodName}:`,
          response.data.msg,
        );
        // 如果测试食物失败，尝试测试"米饭"这个常见食物
        if (foodName !== '米饭') {
          console.log('Testing with a common food "米饭" instead');
          return await this.fetchFoodNutrition('米饭');
        }
        return null;
      }

      console.log(
        `TianAPI successful data for ${foodName}:`,
        response.data.result,
      );

      // API返回的是列表，我们取第一个结果
      const foodData =
        response.data.result.list && response.data.result.list.length > 0
          ? response.data.result.list[0]
          : null;

      if (!foodData) {
        console.error(`No food data found for ${foodName}`);
        return null;
      }

      console.log(`Selected food data for ${foodName}:`, foodData);

      // 转换数据为标准格式
      const standardizedData = this.mapTianApiDataToStandard(foodData);
      console.log(
        `Standardized nutrition data for ${foodName}:`,
        standardizedData,
      );

      return standardizedData;
    } catch (error) {
      console.error(
        `Error fetching nutrition data from TianAPI for ${foodName}:`,
        error.response ? error.response.data : error.message,
      );
      return null;
    }
  },

  // 将TianAPI的数据映射到标准格式
  mapTianApiDataToStandard(apiData) {
    if (!apiData) return null;

    console.log('Original API data:', JSON.stringify(apiData));

    // TianAPI字段映射表 - 转换为人类可读的名称
    const fieldMapping = {
      // 基本营养素
      rl: 'heat', // 热量 (kcal)
      dbz: 'protein', // 蛋白质 (g)
      zf: 'fat', // 脂肪 (g)
      tei: 'carbohydrate', // 碳水化合物 (g)
      shhf: 'fiber', // 膳食纤维 (g)

      // 维生素
      va: 'va', // 维生素A (μg)
      vb1: 'vb1', // 维生素B1 (mg)
      vb2: 'vb2', // 维生素B2 (mg)
      vc: 'vc', // 维生素C (mg)

      // 矿物质
      gai: 'calcium', // 钙 (mg)
      tie: 'iron', // 铁 (mg)
      xin: 'zinc', // 锌 (mg)
      mei: 'magnesium', // 镁 (mg)
      jia: 'potassium', // 钾 (mg)
      na: 'sodium', // 钠 (mg)

      // 类别
      type: 'leixing', // 食物类别
    };

    // 字段的中文名称展示
    const fieldDisplayNames = {
      heat: '热量',
      protein: '蛋白质',
      fat: '脂肪',
      carbohydrate: '碳水化合物',
      fiber: '膳食纤维',
      va: '维生素A',
      vb1: '维生素B1',
      vb2: '维生素B2',
      vc: '维生素C',
      calcium: '钙',
      iron: '铁',
      zinc: '锌',
      magnesium: '镁',
      potassium: '钾',
      sodium: '钠',
      leixing: '食物类别',
    };

    console.log('Available fields in API data:', Object.keys(apiData));

    // 食物类别映射表
    const typeMapping = {
      谷类: '谷物类',
      薯类淀粉: '谷物类',
      干豆类: '豆类',
      蔬菜: '蔬菜类',
      蔬菜类: '蔬菜',
      菌藻: '蔬菜类',
      水果: '水果类',
      水果类: '水果',
      坚果种子: '坚果类',
      畜肉: '肉类',
      肉类: '肉禽',
      禽肉: '禽类',
      禽类: '肉禽',
      乳类: '乳制品',
      蛋类: '蛋类',
      鱼虾蟹贝: '水产',
      油脂: '油脂类',
      调味品: '调味品',
      饮料: '饮料类',
      零食小吃: '零食类',
      糖果点心: '糖类',
      酒精饮料: '酒类',
    };

    // 转换后的数据
    const standardData = {};

    // 转换字段
    for (const [apiField, standardField] of Object.entries(fieldMapping)) {
      if (apiData[apiField] !== undefined) {
        // 对于类别字段，进行额外的映射
        if (apiField === 'type') {
          standardData[standardField] =
            typeMapping[apiData[apiField]] || apiData[apiField];
        } else {
          standardData[standardField] = apiData[apiField];
        }
        console.log(
          `Mapped ${apiField} (${apiData[apiField]}) to ${standardField}`,
        );
      }
    }

    // 确保至少有一个分类
    if (!standardData.leixing) {
      standardData.leixing = '其他';
      console.log('Used default category: 其他');
    }

    // 添加字段的显示名称
    standardData.displayNames = fieldDisplayNames;

    console.log('Final standardized data:', standardData);
    return standardData;
  },

  // 从用户已点菜单获取营养数据
  async getMealPlanNutritionData(userId) {
    try {
      // 导入MealPlanRepository以获取用户已点菜单
      const MealPlanRepository = require('../meal-plans/repositories/meal-plan.repository');

      // 获取用户当前一周内已点菜单
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const mealPlans = await MealPlanRepository.getUserMealPlans(
        userId,
        startOfWeek,
        endOfWeek,
      );

      // 如果没有找到膳食计划，添加一些测试食材进行测试
      let ingredients = [];

      if (!mealPlans || mealPlans.length === 0) {
        console.log('No meal plans found for user:', userId);
        console.log('Using test ingredients for API testing');

        // 添加一些测试食材
        ingredients = [
          { name: '牛肉', quantity: 500, unit: 'g' },
          { name: '米饭', quantity: 200, unit: 'g' },
          { name: '西兰花', quantity: 150, unit: 'g' },
          { name: '豆腐', quantity: 200, unit: 'g' },
        ];
      } else {
        // 处理找到的膳食计划
        for (const meal of mealPlans) {
          // 获取食谱和食材
          const recipe = meal.recipeId;
          if (
            !recipe ||
            !recipe.ingredients ||
            !Array.isArray(recipe.ingredients)
          ) {
            continue;
          }

          // 收集所有食材
          ingredients = ingredients.concat(recipe.ingredients);
        }

        // 如果没有找到食材，使用测试食材
        if (ingredients.length === 0) {
          console.log(
            'No ingredients found in meal plans, using test ingredients',
          );
          ingredients = [
            { name: '牛肉', quantity: 500, unit: 'g' },
            { name: '米饭', quantity: 200, unit: 'g' },
            { name: '西兰花', quantity: 150, unit: 'g' },
            { name: '豆腐', quantity: 200, unit: 'g' },
          ];
        }
      }

      // 初始化营养汇总数据
      const nutritionSummary = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        vitamins: {},
        minerals: {},
      };

      // 膳食结构统计
      const dietStructure = {
        grains: 0,
        vegetables: 0,
        fruits: 0,
        protein: 0,
        dairy: 0,
        fats: 0,
      };

      // 食材类别映射表
      const categoryMapping = {
        谷物类: 'grains',
        米面豆: 'grains',
        杂粮: 'grains',
        谷类: 'grains',
        蔬菜类: 'vegetables',
        蔬菜: 'vegetables',
        菌藻: 'vegetables',
        水果类: 'fruits',
        水果: 'fruits',
        肉禽类: 'protein',
        肉类: 'protein',
        禽类: 'protein',
        畜肉: 'protein',
        禽肉: 'protein',
        鱼虾类: 'protein',
        水产: 'protein',
        鱼虾蟹贝: 'protein',
        蛋类: 'protein',
        豆类: 'protein',
        干豆类: 'protein',
        奶类: 'dairy',
        乳类: 'dairy',
        乳制品: 'dairy',
        油脂类: 'fats',
        油脂: 'fats',
        调味品: 'fats',
      };

      // 字段的中文名称展示
      const displayNames = {
        calories: '热量',
        protein: '蛋白质',
        fat: '脂肪',
        carbs: '碳水化合物',
        fiber: '膳食纤维',
        grains: '谷物',
        vegetables: '蔬菜',
        fruits: '水果',
        proteinFood: '蛋白质食物',
        dairy: '乳制品',
        fats: '油脂',
      };

      // 处理每个食材
      console.log(
        `Processing ${ingredients.length} ingredients for nutrition data`,
      );
      for (const ingredient of ingredients) {
        if (!ingredient.name) continue;

        // 从tianapi获取食材营养数据
        const nutritionData = await this.fetchFoodNutrition(ingredient.name);
        console.log(`Nutrition data for ${ingredient.name}:`, nutritionData);

        if (!nutritionData) {
          console.log(
            `No nutrition data found for ${ingredient.name}, skipping`,
          );
          continue;
        }

        // 计算基于食材用量的营养值
        const quantity = parseFloat(ingredient.quantity) || 0;
        const defaultServingSize = 100; // 假设API返回的营养成分是基于100g计算的
        const multiplier = quantity / defaultServingSize;

        // 汇总主要营养成分
        if (nutritionData.heat) {
          // 热量 (kcal)
          nutritionSummary.calories +=
            parseFloat(nutritionData.heat) * multiplier;
        }
        if (nutritionData.protein) {
          // 蛋白质 (g)
          nutritionSummary.protein +=
            parseFloat(nutritionData.protein) * multiplier;
        }
        if (nutritionData.fat) {
          // 脂肪 (g)
          nutritionSummary.fat += parseFloat(nutritionData.fat) * multiplier;
        }
        if (nutritionData.carbohydrate) {
          // 碳水化合物 (g)
          nutritionSummary.carbs +=
            parseFloat(nutritionData.carbohydrate) * multiplier;
        }
        if (nutritionData.fiber) {
          // 膳食纤维 (g)
          nutritionSummary.fiber +=
            parseFloat(nutritionData.fiber) * multiplier;
        }

        // 统计食材类别，用于饮食结构计算
        if (nutritionData.leixing) {
          const category = categoryMapping[nutritionData.leixing] || null;
          if (category && dietStructure[category] !== undefined) {
            dietStructure[category] += 1;
          }
        }

        // 处理维生素
        for (const key in nutritionData) {
          // 检查是否为维生素项
          if (
            key.startsWith('va') ||
            key.startsWith('vb') ||
            key.includes('vitamin')
          ) {
            if (!nutritionSummary.vitamins[key]) {
              nutritionSummary.vitamins[key] = 0;
            }
            nutritionSummary.vitamins[key] +=
              parseFloat(nutritionData[key] || 0) * multiplier;
          }

          // 检查是否为矿物质项
          if (
            [
              'calcium',
              'iron',
              'zinc',
              'magnesium',
              'potassium',
              'sodium',
            ].includes(key)
          ) {
            if (!nutritionSummary.minerals[key]) {
              nutritionSummary.minerals[key] = 0;
            }
            nutritionSummary.minerals[key] +=
              parseFloat(nutritionData[key] || 0) * multiplier;
          }
        }
      }

      // 计算饮食结构百分比
      const totalCategories = Object.values(dietStructure).reduce(
        (sum, val) => sum + val,
        0,
      );
      if (totalCategories > 0) {
        for (const category in dietStructure) {
          dietStructure[category] = Math.round(
            (dietStructure[category] / totalCategories) * 100,
          );
        }
      }

      // 格式化营养数据，以适配前端期望的格式
      const nutrientData = {
        calories: {
          value: Math.round(nutritionSummary.calories),
          max: 2200,
          unit: 'kcal',
          color: '#f44336',
          displayName: displayNames['calories'],
        },
        protein: {
          value: Math.round(nutritionSummary.protein),
          max: 80,
          unit: 'g',
          color: '#3f51b5',
          displayName: displayNames['protein'],
        },
        fat: {
          value: Math.round(nutritionSummary.fat),
          max: 65,
          unit: 'g',
          color: '#ff9800',
          displayName: displayNames['fat'],
        },
        carbs: {
          value: Math.round(nutritionSummary.carbs),
          max: 300,
          unit: 'g',
          color: '#4caf50',
          displayName: displayNames['carbs'],
        },
        fiber: {
          value: Math.round(nutritionSummary.fiber),
          max: 25,
          unit: 'g',
          color: '#9c27b0',
          displayName: displayNames['fiber'],
        },
      };

      // 格式化饮食结构数据
      const formattedDietStructure = {
        grains: {
          value: dietStructure.grains,
          recommended: 25,
          unit: '%',
          displayName: displayNames['grains'],
        },
        vegetables: {
          value: dietStructure.vegetables,
          recommended: 35,
          unit: '%',
          displayName: displayNames['vegetables'],
        },
        fruits: {
          value: dietStructure.fruits,
          recommended: 15,
          unit: '%',
          displayName: displayNames['fruits'],
        },
        protein: {
          value: dietStructure.protein,
          recommended: 20,
          unit: '%',
          displayName: displayNames['proteinFood'],
        },
        dairy: {
          value: dietStructure.dairy,
          recommended: 15,
          unit: '%',
          displayName: displayNames['dairy'],
        },
        fats: {
          value: dietStructure.fats,
          recommended: 10,
          unit: '%',
          displayName: displayNames['fats'],
        },
      };

      return {
        nutrientData,
        dietStructure: formattedDietStructure,
      };
    } catch (error) {
      console.error('Error getting meal plan nutrition data:', error);
      return {
        nutrientData: null,
        dietStructure: null,
      };
    }
  },

  // 获取所有健康分析数据
  async getAllHealthData(userId, timeRange = 'week') {
    // 获取从已点菜单计算的营养数据
    const mealPlanNutrition = await this.getMealPlanNutritionData(userId);

    return {
      nutrientData:
        mealPlanNutrition.nutrientData || (await this.getNutrientData(userId)),
      dietStructure:
        mealPlanNutrition.dietStructure ||
        (await this.getDietStructure(userId)),
      nutritionTrends: await this.getNutritionTrends(
        userId,
        timeRange === 'week' ? 7 : 30,
      ),
      vitaminIntake: await this.getVitaminIntake(userId),
      mineralIntake: await this.getMineralIntake(userId),
      ingredientUsage: await this.getIngredientUsage(userId),
      nutritionAdvice: await this.getNutritionAdvice(userId),
      ingredientDiversity: await this.getIngredientDiversity(),
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
