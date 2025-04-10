const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const port = 3001;

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

apiRouter.get('/recipes/recommended', (req, res) => {
  res.json([
    {
      id: 1,
      name: '番茄炒蛋',
      cookingTime: 15,
      imageUrl: 'https://example.com/tomato-egg.jpg',
      cuisineId: 1, // 川菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 2,
      name: '红烧肉',
      cookingTime: 60,
      imageUrl: 'https://example.com/braised-pork.jpg',
      cuisineId: 2, // 粤菜
      mealType: 'lunch',
      spiceLevel: 1,
    },
    {
      id: 3,
      name: '清蒸鱼',
      cookingTime: 30,
      imageUrl: 'https://example.com/steamed-fish.jpg',
      cuisineId: 2, // 粤菜
      mealType: 'dinner',
      spiceLevel: 0,
    },
    {
      id: 4,
      name: '麻婆豆腐',
      cookingTime: 25,
      imageUrl: 'https://example.com/mapo-tofu.jpg',
      cuisineId: 1, // 川菜
      mealType: 'lunch',
      spiceLevel: 3,
    },
    {
      id: 5,
      name: '小笼包',
      cookingTime: 45,
      imageUrl: 'https://example.com/xiaolongbao.jpg',
      cuisineId: 8, // 江苏菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 6,
      name: '宫保鸡丁',
      cookingTime: 30,
      imageUrl: 'https://example.com/kungpao-chicken.jpg',
      cuisineId: 1, // 川菜
      mealType: 'dinner',
      spiceLevel: 2,
    },
  ]);
});

apiRouter.get('/recipes/personal', (req, res) => {
  res.json([
    {
      id: 7,
      name: '自创炒饭',
      cookingTime: 20,
      imageUrl: 'https://example.com/fried-rice.jpg',
      cuisineId: 8, // 江苏菜
      mealType: 'lunch',
      spiceLevel: 1,
    },
    {
      id: 8,
      name: '家常豆腐',
      cookingTime: 25,
      imageUrl: 'https://example.com/tofu.jpg',
      cuisineId: 4, // 湘菜
      mealType: 'dinner',
      spiceLevel: 2,
    },
  ]);
});

apiRouter.get('/recipes/favorite', (req, res) => {
  res.json([
    {
      id: 1,
      name: '番茄炒蛋',
      cookingTime: 15,
      imageUrl: 'https://example.com/tomato-egg.jpg',
      cuisineId: 1, // 川菜
      mealType: 'breakfast',
      spiceLevel: 0,
    },
    {
      id: 3,
      name: '清蒸鱼',
      cookingTime: 30,
      imageUrl: 'https://example.com/steamed-fish.jpg',
      cuisineId: 2, // 粤菜
      mealType: 'dinner',
      spiceLevel: 0,
    },
    {
      id: 6,
      name: '宫保鸡丁',
      cookingTime: 30,
      imageUrl: 'https://example.com/kungpao-chicken.jpg',
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
      imageUrl: 'https://example.com/tomato-egg.jpg',
    },
    {
      id: 6,
      name: '西红柿汤',
      cookingTime: 25,
      imageUrl: 'https://example.com/tomato-soup.jpg',
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
  res.json([
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
  ]);
});

// Add recipe to meal plan endpoint
apiRouter.post('/mealplan/add', (req, res) => {
  const { recipeId, date, mealType, servings } = req.body;
  console.log(
    `Adding recipe ${recipeId} to meal plan for ${date} (${mealType})`,
  );
  res.json({
    id: Math.floor(Math.random() * 1000),
    date,
    mealType,
    servings: servings || 1,
    recipe: {
      id: recipeId,
      name: recipeId === 1 ? '番茄炒蛋' : recipeId === 2 ? '红烧肉' : '清蒸鱼',
      cookingTime: recipeId === 1 ? 15 : recipeId === 2 ? 60 : 30,
    },
  });
});

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
