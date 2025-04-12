const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const healthRoutes = require('./health/health.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const mealPlanRoutes = require('./meal-plans/meal-plan.routes');
const recipeRoutes = require('./recipes/recipe.routes');

// Create Express app
const app = express();
const port = 3001;

// Serve static files from the public directory
app.use('/assets', express.static('public/assets'));

// Request logging middleware (place it first to log all requests)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// CORS settings - allow requests from the client (any origin for now)
app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
const apiRouter = express.Router();

// 添加认证中间件函数
const authenticateUser = (req, res, next) => {
  // 从请求头获取 Authorization token
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    // 实际项目中，这里应该验证 token
    // 为了简化，我们只检查是否存在 token
    if (token) {
      // 这里应该解析 token 并获取用户 ID
      // 将用户 ID 附加到请求对象
      req.userId = '000000000000000000000001'; // 模拟用户 ID
      next();
    } else {
      res.status(401).json({ error: 'Invalid token format' });
    }
  } else {
    // 允许未授权访问，但不提供 userId
    console.log('Unauthenticated request to:', req.originalUrl);
    next();
  }
};

// 应用认证中间件到API路由
apiRouter.use(authenticateUser);

app.use('/api', apiRouter);

// Root API endpoint
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Welcome to Health Diet API!' });
});

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes
apiRouter.post('/auth/login', (req, res) => {
  const { email } = req.body;
  console.log(`Login attempt for: ${email}`);
  res.json({
    token: 'sample-token-' + Date.now(),
    user: { id: 1, email: email || 'user@example.com' },
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const userData = req.body;
  console.log('Registering user:', userData);
  res.json({ success: true, message: 'User registered successfully' });
});

// User routes
apiRouter.get('/users/profile', (req, res) => {
  res.json({ id: 1, email: 'user@example.com', name: 'Test User' });
});

apiRouter.patch('/users/profile', (req, res) => {
  const userData = req.body;
  console.log('Updating user profile:', userData);
  res.json({
    id: 1,
    email: userData.email || 'user@example.com',
    name: userData.name || 'Test User',
    ...userData,
  });
});

// Family member routes
apiRouter.get('/users/family', (req, res) => {
  res.json([
    { id: 1, name: 'Family Member 1', relationship: 'Spouse' },
    { id: 2, name: 'Family Member 2', relationship: 'Child' },
  ]);
});

// Recipe routes
apiRouter.get('/recipes', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Pasta', cookingTime: 30 },
      { id: 2, name: 'Salad', cookingTime: 15 },
    ],
    total: 2,
  });
});

// 模拟存储个人菜谱的数组
let personalRecipes = [
  {
    id: 7,
    name: '自创炒饭',
    cookingTime: 20,
    imageUrl: '/assets/food-placeholder.svg',
    cuisineId: 8, // 江苏菜
    mealType: 'lunch',
    spiceLevel: 1,
  },
  {
    id: 8,
    name: '家常豆腐',
    cookingTime: 25,
    imageUrl: '/assets/food-placeholder.svg',
    cuisineId: 4, // 湘菜
    mealType: 'dinner',
    spiceLevel: 2,
  },
];

apiRouter.post('/recipes', (req, res) => {
  const recipeData = req.body;
  console.log('Creating recipe:', recipeData);

  // 创建新的菜谱记录
  const newRecipe = {
    id:
      personalRecipes.length > 0
        ? Math.max(...personalRecipes.map((r) => r.id)) + 1
        : 1,
    name: recipeData.name,
    cookingTime: recipeData.cookingTime || 30,
    imageUrl: '/assets/food-placeholder.svg',
    cuisineId: recipeData.cuisine || 1,
    mealType: recipeData.mealType || 'dinner',
    spiceLevel: recipeData.spiceLevel || 0,
  };

  // 将新菜谱添加到个人菜谱数组中
  personalRecipes.push(newRecipe);

  res.json({
    success: true,
    message: 'Recipe created successfully',
    recipe: newRecipe,
  });
});

apiRouter.get('/recipes/recommended', (req, res) => {
  res.json([
    {
      id: 1,
      name: '番茄炒蛋',
      cookingTime: 15,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 1, // 川菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 2,
      name: '红烧肉',
      cookingTime: 60,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 2, // 粤菜
      mealType: 'lunch',
      spiceLevel: 1,
    },
    {
      id: 3,
      name: '清蒸鱼',
      cookingTime: 30,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 2, // 粤菜
      mealType: 'dinner',
      spiceLevel: 0,
    },
    {
      id: 4,
      name: '麻婆豆腐',
      cookingTime: 25,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 1, // 川菜
      mealType: 'lunch',
      spiceLevel: 3,
    },
    {
      id: 5,
      name: '小笼包',
      cookingTime: 45,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 8, // 江苏菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 6,
      name: '宫保鸡丁',
      cookingTime: 30,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 1, // 川菜
      mealType: 'dinner',
      spiceLevel: 2,
    },
  ]);
});

apiRouter.get('/recipes/personal', (req, res) => {
  res.json(personalRecipes);
});

apiRouter.get('/recipes/favorite', (req, res) => {
  res.json([
    {
      id: 1,
      name: '番茄炒蛋',
      cookingTime: 15,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 1, // 川菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 3,
      name: '清蒸鱼',
      cookingTime: 30,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 2, // 粤菜
      mealType: 'dinner',
      spiceLevel: 0,
    },
    {
      id: 6,
      name: '宫保鸡丁',
      cookingTime: 30,
      imageUrl: '/assets/food-placeholder.svg',
      cuisineId: 1, // 川菜
      mealType: 'dinner',
      spiceLevel: 2,
    },
  ]);
});

// Add favorite recipe endpoint
apiRouter.post('/recipes/:id/favorite', (req, res) => {
  const recipeId = parseInt(req.params.id);
  console.log(`Toggling favorite status for recipe: ${recipeId}`);
  res.json({ success: true });
});

apiRouter.get('/recipes/search', (req, res) => {
  const query = req.query.q;
  console.log(`Searching recipes for: ${query}`);
  res.json([
    {
      id: 1,
      name: '番茄炒蛋',
      cookingTime: 15,
      imageUrl: '/assets/food-placeholder.svg',
    },
    {
      id: 6,
      name: '西红柿汤',
      cookingTime: 25,
      imageUrl: '/assets/food-placeholder.svg',
    },
  ]);
});

// Inventory routes
apiRouter.get('/inventory', (req, res) => {
  res.json([
    { id: 1, name: '鸡蛋', quantity: 10, unit: '个', category: 'dairy' },
    { id: 2, name: '西红柿', quantity: 5, unit: '个', category: 'vegetables' },
    { id: 3, name: '面粉', quantity: 500, unit: 'g', category: 'grains' },
  ]);
});

// Shopping list endpoint
apiRouter.get('/inventory/shopping-list', (req, res) => {
  res.json([
    { id: 4, name: '生菜', quantity: 2, unit: '个', category: 'vegetables' },
    { id: 5, name: '牛肉', quantity: 500, unit: 'g', category: 'meat' },
    { id: 6, name: '土豆', quantity: 4, unit: '个', category: 'vegetables' },
    { id: 7, name: '胡萝卜', quantity: 3, unit: '个', category: 'vegetables' },
  ]);
});

// Shopping list purchase endpoint
apiRouter.post('/inventory/purchased', (req, res) => {
  const { ingredientIds } = req.body;
  console.log(`Marking ingredients as purchased: ${ingredientIds}`);
  res.json({ success: true, purchasedCount: ingredientIds.length });
});

// Health routes
apiRouter.get('/health/nutrition/:timeRange', (req, res) => {
  const timeRange = req.params.timeRange;
  console.log(`Fetching nutrition data for time range: ${timeRange}`);
  res.json({
    calories: { daily: [1850, 1900, 1800, 2000, 1750, 1800, 1900] },
    protein: { daily: [75, 80, 70, 85, 65, 75, 80] },
    fat: { daily: [65, 70, 60, 75, 50, 65, 70] },
    carbs: { daily: [220, 230, 210, 240, 200, 220, 230] },
  });
});

// Health recipes statistics endpoint
apiRouter.get('/health/recipes/:timeRange', (req, res) => {
  const timeRange = req.params.timeRange;
  console.log(`Fetching recipe statistics for time range: ${timeRange}`);
  res.json({
    mostCooked: [
      { id: 1, name: '番茄炒蛋', count: 3 },
      { id: 3, name: '清蒸鱼', count: 2 },
      { id: 2, name: '红烧肉', count: 1 },
    ],
    recipesByMealType: {
      breakfast: 2,
      lunch: 1,
      dinner: 3,
    },
  });
});

// Health ingredients statistics endpoint
apiRouter.get('/health/ingredients/:timeRange', (req, res) => {
  const timeRange = req.params.timeRange;
  console.log(`Fetching ingredient statistics for time range: ${timeRange}`);
  res.json({
    mostUsed: [
      { name: '鸡蛋', count: 8, unit: '个' },
      { name: '西红柿', count: 5, unit: '个' },
      { name: '葱', count: 4, unit: '根' },
    ],
    byCategory: {
      vegetables: 12,
      meat: 3,
      dairy: 9,
      grains: 6,
      condiments: 7,
      fruits: 2,
    },
  });
});

// Meal plan routes
apiRouter.get('/meal-plans', (req, res) => {
  const { startDate, endDate } = req.query;
  console.log(`Fetching meal plans from ${startDate} to ${endDate}`);

  // 如果没有初始化存储，则初始化
  if (!app.locals.mealPlans) {
    app.locals.mealPlans = [
      {
        id: 1,
        date: startDate || '2023-04-01',
        mealType: 'breakfast',
        recipe: { id: 1, name: '番茄炒蛋', cookingTime: 15 },
      },
      {
        id: 2,
        date: startDate || '2023-04-01',
        mealType: 'dinner',
        recipe: { id: 3, name: '清蒸鱼', cookingTime: 30 },
      },
    ];
  }

  // 根据日期范围筛选结果
  let mealPlans = app.locals.mealPlans;

  if (startDate && endDate) {
    mealPlans = mealPlans.filter(
      (meal) => meal.date >= startDate && meal.date <= endDate,
    );
  }

  res.json(mealPlans);
});

// Add recipe to meal plan endpoint
apiRouter.post('/mealplan/add', (req, res) => {
  const { recipeId, date, mealType, servings } = req.body;
  console.log(
    `Adding recipe ${recipeId} to meal plan for ${date} (${mealType})`,
  );

  // 查找对应的菜谱信息
  let recipeName = '未知菜品';
  let cookingTime = 30;

  // 从推荐菜谱中查找
  const recommendedRecipes = [
    { id: 1, name: '番茄炒蛋', cookingTime: 15 },
    { id: 2, name: '红烧肉', cookingTime: 60 },
    { id: 3, name: '清蒸鱼', cookingTime: 30 },
    { id: 4, name: '麻婆豆腐', cookingTime: 25 },
    { id: 5, name: '小笼包', cookingTime: 45 },
    { id: 6, name: '宫保鸡丁', cookingTime: 30 },
  ];

  // 从个人菜谱中查找
  const personalRecipes = [
    { id: 7, name: '自创炒饭', cookingTime: 20 },
    { id: 8, name: '家常豆腐', cookingTime: 25 },
    { id: 9, name: '东坡肉', cookingTime: 30 },
  ];

  // 查找对应菜谱
  const allRecipes = [...recommendedRecipes, ...personalRecipes];
  const recipe = allRecipes.find((r) => r.id === parseInt(recipeId));

  if (recipe) {
    recipeName = recipe.name;
    cookingTime = recipe.cookingTime;
  }

  // 创建新添加的菜单项
  const mealPlanItem = {
    id: Math.floor(Math.random() * 1000),
    date,
    mealType,
    servings: servings || 1,
    recipe: {
      id: parseInt(recipeId),
      name: recipeName,
      cookingTime: cookingTime,
    },
  };

  // 将新项目添加到内存中
  if (!app.locals.mealPlans) {
    app.locals.mealPlans = [];
  }
  app.locals.mealPlans.push(mealPlanItem);

  res.json(mealPlanItem);
});

// 添加健康分析路由
apiRouter.use('/health', healthRoutes);

// 添加库存路由
apiRouter.use('/inventory', inventoryRoutes);

// 添加膳食计划路由
apiRouter.use('/meal-plans', mealPlanRoutes);

// 添加食谱路由
apiRouter.use('/recipes', recipeRoutes);

// Start server
async function bootstrap() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost/health-diet',
    );
    console.log('Connected to MongoDB');

    // Start server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}/api`);
      console.log('API is ready to accept requests from client');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

bootstrap();
