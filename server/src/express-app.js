const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// 加载环境变量
require('dotenv').config();
const healthRoutes = require('./health/health.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const mealPlanRoutes = require('./meal-plans/meal-plan.routes');
const recipeRoutes = require('./recipes/recipe.routes');
const RecipeRepository = require('./recipes/repositories/recipe.repository');
const FamilyMemberRepository = require('./users/repositories/family-member.repository');
const UserRepository = require('./users/repositories/user.repository');

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

// User routes
apiRouter.get('/users/profile', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('获取用户资料，用户ID:', userId);

    // 验证UserRepository是否可用
    if (
      !UserRepository ||
      typeof UserRepository.getUserProfile !== 'function'
    ) {
      console.error('UserRepository未正确加载');
      return res.status(500).json({ error: '系统错误：存储库未加载' });
    }

    const userProfile = await UserRepository.getUserProfile(userId);
    console.log('用户资料获取成功:', userProfile);

    res.json(userProfile);
  } catch (error) {
    console.error('获取用户资料出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取用户资料失败: ' + error.message });
  }
});

apiRouter.patch('/users/profile', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const userData = req.body;
    console.log('更新用户资料，用户ID:', userId);
    console.log('用户资料数据:', userData);

    // 验证UserRepository是否可用
    if (
      !UserRepository ||
      typeof UserRepository.updateUserProfile !== 'function'
    ) {
      console.error('UserRepository未正确加载');
      return res.status(500).json({ error: '系统错误：存储库未加载' });
    }

    const updatedProfile = await UserRepository.updateUserProfile(
      userId,
      userData,
    );
    console.log('用户资料更新成功:', updatedProfile);

    res.json(updatedProfile);
  } catch (error) {
    console.error('更新用户资料出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '更新用户资料失败: ' + error.message });
  }
});

// Family member routes
apiRouter.get('/users/family', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('获取家庭成员列表，用户ID:', userId);

    // 验证FamilyMemberRepository是否可用
    if (
      !FamilyMemberRepository ||
      typeof FamilyMemberRepository.getFamilyMembers !== 'function'
    ) {
      console.error('FamilyMemberRepository未正确加载');
      return res.status(500).json({ error: '系统错误：存储库未加载' });
    }

    const familyMembers = await FamilyMemberRepository.getFamilyMembers(userId);
    console.log('找到家庭成员数量:', familyMembers.length);

    res.json(familyMembers);
  } catch (error) {
    console.error('获取家庭成员出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取家庭成员失败: ' + error.message });
  }
});

// Add family member route
apiRouter.post('/users/family', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const memberData = req.body;
    console.log('添加家庭成员，用户ID:', userId);
    console.log('家庭成员数据:', memberData);

    // 验证必填字段
    if (!memberData.name || !memberData.relationship) {
      return res.status(400).json({ error: '姓名和关系为必填项' });
    }

    // 验证FamilyMemberRepository是否可用
    if (
      !FamilyMemberRepository ||
      typeof FamilyMemberRepository.addFamilyMember !== 'function'
    ) {
      console.error('FamilyMemberRepository未正确加载');
      return res.status(500).json({ error: '系统错误：存储库未加载' });
    }

    const newMember = await FamilyMemberRepository.addFamilyMember(
      userId,
      memberData,
    );
    console.log('家庭成员添加成功，ID:', newMember._id);

    res.status(201).json(newMember);
  } catch (error) {
    console.error('添加家庭成员出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '添加家庭成员失败: ' + error.message });
  }
});

// Update family member route
apiRouter.patch('/users/family/:id', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const { id } = req.params;
    const updateData = req.body;
    console.log(`Updating family member ${id}:`, updateData);

    const updatedMember = await FamilyMemberRepository.updateFamilyMember(
      userId,
      id,
      updateData,
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating family member:', error);
    res
      .status(500)
      .json({ error: 'Failed to update family member: ' + error.message });
  }
});

// Delete family member route
apiRouter.delete('/users/family/:id', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const { id } = req.params;
    console.log(`Deleting family member ${id}`);

    const result = await FamilyMemberRepository.deleteFamilyMember(userId, id);

    if (!result) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json({ success: true, message: `Family member ${id} deleted` });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res
      .status(500)
      .json({ error: 'Failed to delete family member: ' + error.message });
  }
});

// 添加个人菜谱接口 - 从数据库获取数据
apiRouter.get('/recipes/personal', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';

    // 导入并使用RecipeService
    const RecipeService = require('./recipes/recipe.service');

    // 从数据库获取用户的个人菜谱
    const userRecipes = await RecipeService.getUserRecipes(userId);

    res.json(userRecipes);
  } catch (error) {
    console.error('Error getting personal recipes:', error);
    res.status(500).json({ error: 'Failed to get personal recipes' });
  }
});

// Shopping list purchase endpoint - This is redirected to the proper implementation
apiRouter.post('/inventory/purchased', (req, res) => {
  const { ingredientIds } = req.body;
  console.log(`Marking ingredients as purchased: ${ingredientIds}`);

  // Forward to the actual database implementation
  req.url = '/inventory/shopping-list/purchase-multiple';
  req.app.handle(req, res);
});

// 添加日志验证导入是否正确
try {
  console.log('RecipeRepository loaded successfully', typeof RecipeRepository);

  // 添加健康分析路由
  apiRouter.use('/health', healthRoutes);

  // 添加库存路由
  apiRouter.use('/inventory', inventoryRoutes);

  // 添加膳食计划路由
  apiRouter.use('/meal-plans', mealPlanRoutes);

  // 添加食谱路由
  apiRouter.use('/recipes', recipeRoutes);
} catch (error) {
  console.error('加载RecipeRepository时出错:', error);
}

// Add a route to delete a test user
apiRouter.delete('/users/profile/test', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('删除测试用户，用户ID:', userId);

    // 删除用户
    const result = await mongoose.connection
      .collection('users')
      .deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
    console.log('删除结果:', result);

    res.json({ success: true, message: '测试用户已删除' });
  } catch (error) {
    console.error('删除测试用户出错:', error);
    res.status(500).json({ error: '删除测试用户失败: ' + error.message });
  }
});

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
