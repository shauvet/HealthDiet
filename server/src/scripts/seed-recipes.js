/**
 * 食谱数据导入脚本
 * 将模拟食谱数据正式导入到数据库中
 *
 * 使用方法：
 * node src/scripts/seed-recipes.js
 */

const mongoose = require('mongoose');
const path = require('path');
const { RecipeSchema } = require('../recipes/schemas/recipe.schema');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// 创建Recipe模型
const Recipe = mongoose.model('Recipe', RecipeSchema);

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/healthdiet';
    console.log('尝试连接数据库:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('MongoDB数据库已连接');
  } catch (error) {
    console.error('连接数据库失败:', error.message);
    process.exit(1);
  }
};

// 模拟食谱数据
const recipes = [
  {
    name: '番茄炒蛋',
    description: '简单美味的家常菜',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '鸡蛋', quantity: 3, unit: '个', isMain: true },
      { name: '番茄', quantity: 2, unit: '个', isMain: true },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '葱花', quantity: 5, unit: 'g', isMain: false },
    ],
    steps: [
      '打散鸡蛋，加少许盐',
      '番茄切块',
      '锅内热油，倒入鸡蛋，炒至凝固',
      '加入番茄块，翻炒均匀',
      '加盐调味，撒上葱花即可',
    ],
    mockId: 1,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['家常菜', '快手菜'],
    createdBy: '000000000000000000000001',
  },
  {
    name: '红烧肉',
    description: '经典美味的家常菜',
    cookingTime: 60,
    servings: 4,
    ingredients: [
      { name: '五花肉', quantity: 500, unit: 'g', isMain: true },
      { name: '生姜', quantity: 20, unit: 'g', isMain: false },
      { name: '酱油', quantity: 30, unit: 'ml', isMain: false },
      { name: '白糖', quantity: 15, unit: 'g', isMain: false },
    ],
    steps: [
      '肉切成方块',
      '锅内放油，加入白糖炒至融化',
      '放入肉块煸炒至变色',
      '加入酱油、姜片和水',
      '大火烧开后转小火炖30分钟',
      '收汁即可',
    ],
    mockId: 2,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 2,
    categories: ['家常菜', '肉类'],
    createdBy: '000000000000000000000001',
  },
  {
    name: '清蒸鱼',
    description: '鲜美可口的传统菜肴',
    cookingTime: 25,
    servings: 3,
    ingredients: [
      { name: '鲈鱼', quantity: 1, unit: '条', isMain: true },
      { name: '葱', quantity: 20, unit: 'g', isMain: false },
      { name: '姜', quantity: 15, unit: 'g', isMain: false },
      { name: '蒸鱼豉油', quantity: 15, unit: 'ml', isMain: false },
      { name: '料酒', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '鱼洗净，腹部划两刀',
      '放入盘中，加入料酒',
      '姜切丝，葱切段',
      '上锅蒸8-10分钟',
      '浇上蒸鱼豉油，撒上葱姜即可',
    ],
    mockId: 3,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['海鲜', '蒸菜'],
    createdBy: '000000000000000000000001',
  },
  {
    name: '麻婆豆腐',
    description: '四川名菜，麻辣鲜香',
    cookingTime: 20,
    servings: 2,
    ingredients: [
      { name: '豆腐', quantity: 400, unit: 'g', isMain: true },
      { name: '猪肉末', quantity: 100, unit: 'g', isMain: true },
      { name: '豆瓣酱', quantity: 15, unit: 'g', isMain: false },
      { name: '花椒', quantity: 5, unit: 'g', isMain: false },
      { name: '辣椒面', quantity: 10, unit: 'g', isMain: false },
    ],
    steps: [
      '豆腐切块焯水',
      '锅内放油，炒香肉末',
      '加入豆瓣酱炒出香味',
      '加入豆腐和适量水',
      '小火炖3分钟',
      '勾芡，撒上花椒粉即可',
    ],
    mockId: 4,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 4,
    categories: ['川菜', '豆制品'],
    createdBy: '000000000000000000000001',
  },
  {
    name: '小笼包',
    description: '精致美味的江南点心',
    cookingTime: 40,
    servings: 4,
    ingredients: [
      { name: '面粉', quantity: 300, unit: 'g', isMain: true },
      { name: '猪肉馅', quantity: 200, unit: 'g', isMain: true },
      { name: '葱姜水', quantity: 30, unit: 'ml', isMain: false },
      { name: '酱油', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '和面静置',
      '肉馅加入调料拌匀',
      '面团擀成皮',
      '包入肉馅',
      '上锅蒸8分钟即可',
    ],
    mockId: 5,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['点心', '面食'],
    createdBy: '000000000000000000000001',
  },
  {
    name: '宫保鸡丁',
    description: '经典川菜，甜辣可口',
    cookingTime: 30,
    servings: 2,
    ingredients: [
      { name: '鸡胸肉', quantity: 300, unit: 'g', isMain: true },
      { name: '花生米', quantity: 50, unit: 'g', isMain: false },
      { name: '干辣椒', quantity: 8, unit: '个', isMain: false },
      { name: '黄瓜', quantity: 1, unit: '根', isMain: false },
      { name: '料酒', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '鸡胸肉切丁腌制',
      '黄瓜切丁',
      '锅内放油，爆香干辣椒',
      '放入鸡丁煸炒',
      '加入调料翻炒',
      '最后加入花生米即可',
    ],
    mockId: 6,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 3,
    categories: ['川菜', '鸡肉'],
    createdBy: '000000000000000000000001',
  },
];

// 导入食谱数据
const seedRecipes = async () => {
  try {
    // 清空已存在的mockId食谱数据，避免重复
    await Recipe.deleteMany({ mockId: { $in: [1, 2, 3, 4, 5, 6] } });
    console.log('已清空现有模拟食谱数据');

    // 批量插入新食谱
    await Recipe.insertMany(recipes);
    console.log('成功导入6个食谱数据到数据库');
  } catch (error) {
    console.error('导入食谱数据失败:', error);
  }
};

// 执行导入操作并关闭数据库连接
const runSeed = async () => {
  await connectDB();
  await seedRecipes();
  console.log('数据导入完成！');
  mongoose.disconnect();
  console.log('数据库连接已关闭');
};

// 运行脚本
runSeed();
