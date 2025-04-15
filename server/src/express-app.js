const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// 加载环境变量
require('dotenv').config();
const healthRoutes = require('./health/health.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const mealPlanRoutes = require('./meal-plans/meal-plan.routes');
const recipeRoutes = require('./recipes/recipe.routes');
const userRoutes = require('./users/user.routes');

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
    console.log('收到认证token:', token);

    // 实际项目中，这里应该验证 token
    // 为了简化，我们只检查是否存在 token
    if (token) {
      // 使用固定的userId便于测试
      const userId = '000000000000000000000001';
      req.userId = userId;
      console.log('用户认证成功，userId:', userId);
      next();
    } else {
      res.status(401).json({ error: 'Token格式无效' });
    }
  } else {
    // 允许未授权访问，但不提供 userId
    console.log('未授权请求:', req.originalUrl);
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
  console.log(`登录尝试 - 邮箱: ${email}`);

  // 生成唯一token
  const token = 'sample-token-' + Date.now();
  console.log(`生成token: ${token}`);

  // 分配固定的用户ID便于测试
  const userId = '000000000000000000000001';
  console.log(`为token分配用户ID: ${userId}`);

  res.json({
    token: token,
    user: { id: userId, email: email || 'user@example.com' },
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const userData = req.body;
  console.log('Registering user:', userData);
  res.json({ success: true, message: 'User registered successfully' });
});

// 添加健康分析路由
apiRouter.use('/health', healthRoutes);

// 添加库存路由
apiRouter.use('/inventory', inventoryRoutes);

// 添加膳食计划路由
apiRouter.use('/meal-plans', mealPlanRoutes);

// 添加食谱路由
apiRouter.use('/recipes', recipeRoutes);

// 添加用户路由
apiRouter.use('/users', userRoutes);

// Start server
async function bootstrap() {
  try {
    // Connect to MongoDB
    console.log(
      'Connecting to MongoDB at:',
      process.env.MONGODB_URI || 'mongodb://localhost/health-diet',
    );
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost/health-diet',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log('Connected to MongoDB successfully');

    // 验证数据库连接
    const dbConnection = mongoose.connection;
    console.log('MongoDB connection state:', dbConnection.readyState);
    console.log('Connected to database:', dbConnection.name);

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
