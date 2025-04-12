const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 导入Schema
const {
  User,
  UserSchema,
  FamilyMember,
  FamilyMemberSchema,
} = require('../users/schemas/user.schema');
const { Recipe, RecipeSchema } = require('../recipes/schemas/recipe.schema');
const {
  Ingredient,
  IngredientSchema,
  ShoppingItem,
  ShoppingItemSchema,
} = require('../inventory/schemas/inventory.schema');
const {
  MealPlan,
  MealPlanSchema,
} = require('../meal-plans/schemas/meal-plan.schema');
const {
  DailyNutrition,
  DailyNutritionSchema,
} = require('../health/schemas/health.schema');

// 创建模型
const UserModel = mongoose.model('User', UserSchema);
const FamilyMemberModel = mongoose.model('FamilyMember', FamilyMemberSchema);
const RecipeModel = mongoose.model('Recipe', RecipeSchema);
const IngredientModel = mongoose.model('Ingredient', IngredientSchema);
const ShoppingItemModel = mongoose.model('ShoppingItem', ShoppingItemSchema);
const MealPlanModel = mongoose.model('MealPlan', MealPlanSchema);
const DailyNutritionModel = mongoose.model(
  'DailyNutrition',
  DailyNutritionSchema,
);

// 示例数据
const seedData = async () => {
  try {
    // 连接数据库
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost/health-diet',
    );
    console.log('Connected to MongoDB');

    // 清除现有数据
    await Promise.all([
      UserModel.deleteMany({}),
      FamilyMemberModel.deleteMany({}),
      RecipeModel.deleteMany({}),
      IngredientModel.deleteMany({}),
      ShoppingItemModel.deleteMany({}),
      MealPlanModel.deleteMany({}),
      DailyNutritionModel.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await UserModel.create({
      name: '测试用户',
      email: 'user@example.com',
      password: hashedPassword,
      phone: '13800138000',
      gender: 'male',
      height: 175,
      weight: 70,
      birthdate: new Date('1990-01-01'),
      allergies: ['花生'],
      dietaryRestrictions: ['低糖'],
      healthGoals: ['增肌', '控制体重'],
    });
    console.log('Created test user:', user._id);

    // 创建家庭成员
    const familyMembers = await FamilyMemberModel.insertMany([
      {
        name: '配偶',
        relationship: 'spouse',
        gender: 'female',
        birthdate: new Date('1992-05-15'),
        height: 165,
        weight: 55,
        allergies: ['海鲜'],
        dietaryRestrictions: ['素食'],
        userId: user._id,
      },
      {
        name: '孩子',
        relationship: 'child',
        gender: 'male',
        birthdate: new Date('2015-08-20'),
        height: 120,
        weight: 25,
        allergies: [],
        dietaryRestrictions: [],
        userId: user._id,
      },
    ]);
    console.log(`Created ${familyMembers.length} family members`);

    // 创建食谱
    const recipes = await RecipeModel.insertMany([
      {
        name: '番茄炒蛋',
        description: '简单美味的家常菜',
        imageUrl: '/assets/food-placeholder.svg',
        preparationTime: 5,
        cookingTime: 10,
        servings: 2,
        cuisine: '家常菜',
        spiceLevel: 0,
        ingredients: [
          { name: '鸡蛋', quantity: 3, unit: '个', isMain: true },
          { name: '番茄', quantity: 2, unit: '个', isMain: true },
          { name: '葱', quantity: 1, unit: '根', isMain: false },
          { name: '盐', quantity: 1, unit: '茶匙', isMain: false },
          { name: '糖', quantity: 1, unit: '茶匙', isMain: false },
        ],
        steps: [
          '将鸡蛋打散，加入少许盐搅拌均匀',
          '番茄切块',
          '热锅凉油，倒入鸡蛋液煎至金黄色',
          '放入番茄块，加入盐和糖翻炒',
          '加入切碎的葱花，出锅前翻炒均匀',
        ],
        categories: ['breakfast', '家常菜', '快手菜'],
        tags: ['简单', '经典', '下饭'],
        nutritionPerServing: {
          calories: 150,
          protein: 10,
          fat: 8,
          carbs: 9,
          fiber: 2,
        },
        createdBy: user._id,
      },
      {
        name: '红烧肉',
        description: '经典的中华料理',
        imageUrl: '/assets/food-placeholder.svg',
        preparationTime: 20,
        cookingTime: 60,
        servings: 4,
        cuisine: '川菜',
        spiceLevel: 1,
        ingredients: [
          { name: '五花肉', quantity: 500, unit: '克', isMain: true },
          { name: '姜', quantity: 3, unit: '片', isMain: false },
          { name: '蒜', quantity: 2, unit: '瓣', isMain: false },
          { name: '八角', quantity: 1, unit: '个', isMain: false },
          { name: '桂皮', quantity: 1, unit: '小块', isMain: false },
          { name: '酱油', quantity: 3, unit: '汤匙', isMain: false },
          { name: '白糖', quantity: 2, unit: '汤匙', isMain: false },
        ],
        steps: [
          '将五花肉切成2cm见方的小块',
          '冷水下锅焯水，去除血水',
          '锅中放油，加入姜蒜八角桂皮爆香',
          '放入肉块煸炒至表面金黄',
          '加入适量酱油、白糖、清水，大火烧开',
          '转小火慢炖1小时，至肉烂汤稠',
          '大火收汁，出锅装盘',
        ],
        categories: ['dinner', '川菜', '家宴'],
        tags: ['经典', '下饭', '接待'],
        nutritionPerServing: {
          calories: 450,
          protein: 20,
          fat: 35,
          carbs: 12,
          fiber: 0,
        },
        createdBy: user._id,
      },
      {
        name: '清蒸鱼',
        description: '鲜美健康的蒸鱼',
        imageUrl: '/assets/food-placeholder.svg',
        preparationTime: 15,
        cookingTime: 15,
        servings: 3,
        cuisine: '粤菜',
        spiceLevel: 0,
        ingredients: [
          { name: '鲈鱼', quantity: 1, unit: '条', isMain: true },
          { name: '姜', quantity: 5, unit: '片', isMain: false },
          { name: '葱', quantity: 2, unit: '根', isMain: false },
          { name: '蒜', quantity: 3, unit: '瓣', isMain: false },
          { name: '盐', quantity: 1, unit: '茶匙', isMain: false },
          { name: '料酒', quantity: 1, unit: '汤匙', isMain: false },
          { name: '酱油', quantity: 2, unit: '汤匙', isMain: false },
        ],
        steps: [
          '鱼洗净，在两面划几刀',
          '腌制10分钟（盐、料酒）',
          '姜切丝，葱切段，蒜切片',
          '鱼腹中放入一部分姜丝和葱段',
          '上锅蒸10-15分钟',
          '热油淋在鱼身上，浇上酱油',
          '撒上剩余的葱姜蒜末即可',
        ],
        categories: ['dinner', '粤菜', '家宴'],
        tags: ['健康', '清淡', '家常'],
        nutritionPerServing: {
          calories: 180,
          protein: 25,
          fat: 8,
          carbs: 3,
          fiber: 0,
        },
        createdBy: user._id,
      },
    ]);
    console.log(`Created ${recipes.length} recipes`);

    // 创建库存食材
    const ingredients = await IngredientModel.insertMany([
      {
        name: '鸡蛋',
        quantity: 10,
        unit: '个',
        category: 'dairy',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
        userId: user._id,
      },
      {
        name: '西红柿',
        quantity: 5,
        unit: '个',
        category: 'vegetables',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        userId: user._id,
      },
      {
        name: '面粉',
        quantity: 500,
        unit: 'g',
        category: 'grains',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180天后
        userId: user._id,
      },
      {
        name: '牛肉',
        quantity: 300,
        unit: 'g',
        category: 'meat',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
        userId: user._id,
      },
    ]);
    console.log(`Created ${ingredients.length} inventory ingredients`);

    // 创建购物清单
    const shoppingItems = await ShoppingItemModel.insertMany([
      {
        name: '生菜',
        quantity: 2,
        unit: '个',
        category: 'vegetables',
        purchased: false,
        userId: user._id,
      },
      {
        name: '土豆',
        quantity: 4,
        unit: '个',
        category: 'vegetables',
        purchased: false,
        userId: user._id,
      },
      {
        name: '胡萝卜',
        quantity: 3,
        unit: '个',
        category: 'vegetables',
        purchased: false,
        userId: user._id,
      },
    ]);
    console.log(`Created ${shoppingItems.length} shopping items`);

    // 创建膳食计划
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mealPlans = await MealPlanModel.insertMany([
      {
        date: today,
        mealType: 'breakfast',
        recipeId: recipes[0]._id, // 番茄炒蛋
        servings: 1,
        completed: false,
        userId: user._id,
      },
      {
        date: today,
        mealType: 'dinner',
        recipeId: recipes[2]._id, // 清蒸鱼
        servings: 2,
        completed: false,
        userId: user._id,
      },
      {
        date: tomorrow,
        mealType: 'dinner',
        recipeId: recipes[1]._id, // 红烧肉
        servings: 3,
        completed: false,
        userId: user._id,
      },
    ]);
    console.log(`Created ${mealPlans.length} meal plans`);

    // 创建每日营养数据
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dailyNutrition = await DailyNutritionModel.insertMany([
      {
        date: yesterday,
        calories: 1800,
        protein: 75,
        fat: 60,
        carbs: 220,
        fiber: 20,
        vitamins: [
          { name: '维生素A', amount: 800, unit: 'μg' },
          { name: '维生素C', amount: 85, unit: 'mg' },
        ],
        minerals: [
          { name: '钙', amount: 800, unit: 'mg' },
          { name: '铁', amount: 12, unit: 'mg' },
        ],
        dietStructure: {
          grains: 30,
          vegetables: 20,
          fruits: 10,
          protein: 25,
          dairy: 10,
          fats: 15,
        },
        userId: user._id,
        meals: [
          {
            recipeId: recipes[0]._id,
            mealType: 'breakfast',
            servings: 1,
          },
          {
            recipeId: recipes[1]._id,
            mealType: 'dinner',
            servings: 1,
          },
        ],
      },
      {
        date: today,
        calories: 1900,
        protein: 80,
        fat: 65,
        carbs: 230,
        fiber: 22,
        vitamins: [
          { name: '维生素A', amount: 850, unit: 'μg' },
          { name: '维生素C', amount: 90, unit: 'mg' },
        ],
        minerals: [
          { name: '钙', amount: 850, unit: 'mg' },
          { name: '铁', amount: 13, unit: 'mg' },
        ],
        dietStructure: {
          grains: 28,
          vegetables: 22,
          fruits: 12,
          protein: 24,
          dairy: 9,
          fats: 14,
        },
        userId: user._id,
        meals: [
          {
            recipeId: recipes[0]._id,
            mealType: 'breakfast',
            servings: 1,
          },
          {
            recipeId: recipes[2]._id,
            mealType: 'dinner',
            servings: 1,
          },
        ],
      },
    ]);
    console.log(`Created ${dailyNutrition.length} daily nutrition records`);

    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// 执行数据初始化
seedData();
