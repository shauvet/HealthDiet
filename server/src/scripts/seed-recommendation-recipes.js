/**
 * 推荐食谱数据导入脚本
 * 将模拟推荐食谱数据导入到数据库中
 *
 * 使用方法：
 * node src/scripts/seed-recommendation-recipes.js
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
      process.env.MONGODB_URI || 'mongodb://localhost:27017/health-diet';
    console.log('尝试连接数据库:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('MongoDB数据库已连接');
  } catch (error) {
    console.error('连接数据库失败:', error.message);
    process.exit(1);
  }
};

// 模拟推荐食谱数据 (Part 1 - first 10 recipes)
const recommendationRecipes = [
  {
    name: '健康蔬菜沙拉',
    description: '富含维生素和纤维的健康沙拉',
    cookingTime: 10,
    servings: 2,
    ingredients: [
      { name: '生菜', quantity: 100, unit: 'g', isMain: true },
      { name: '西红柿', quantity: 2, unit: '个', isMain: true },
      { name: '黄瓜', quantity: 1, unit: '根', isMain: true },
      { name: '胡萝卜', quantity: 1, unit: '根', isMain: false },
      { name: '橄榄油', quantity: 15, unit: 'ml', isMain: false },
      { name: '柠檬汁', quantity: 10, unit: 'ml', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
    ],
    steps: [
      '将生菜撕成小块',
      '西红柿切丁',
      '黄瓜切片',
      '胡萝卜切丝',
      '将所有蔬菜混合',
      '加入橄榄油、柠檬汁和盐调味即可',
    ],
    mockId: 201,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['沙拉', '素食', '低卡'],
    tags: ['健康', '蔬菜', '减肥'],
    nutritionPerServing: {
      calories: 120,
      protein: 2,
      fat: 7,
      carbs: 14,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '蒸鸡胸肉配蔬菜',
    description: '高蛋白低脂肪的健身餐',
    cookingTime: 20,
    servings: 1,
    ingredients: [
      { name: '鸡胸肉', quantity: 200, unit: 'g', isMain: true },
      { name: '西兰花', quantity: 100, unit: 'g', isMain: true },
      { name: '胡萝卜', quantity: 1, unit: '根', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '黑胡椒', quantity: 2, unit: 'g', isMain: false },
      { name: '橄榄油', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '鸡胸肉洗净，用盐和黑胡椒腌制10分钟',
      '西兰花和胡萝卜切小块',
      '将鸡胸肉放入蒸锅蒸15分钟',
      '同时蒸蔬菜约5分钟',
      '取出后淋上橄榄油即可',
    ],
    mockId: 202,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 1,
    categories: ['高蛋白', '低脂', '健身餐'],
    tags: ['鸡胸肉', '增肌', '减脂'],
    nutritionPerServing: {
      calories: 320,
      protein: 45,
      fat: 10,
      carbs: 15,
      fiber: 5,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '牛油果三明治',
    description: '营养丰富的早餐选择',
    cookingTime: 5,
    servings: 1,
    ingredients: [
      { name: '全麦面包', quantity: 2, unit: '片', isMain: true },
      { name: '牛油果', quantity: 1, unit: '个', isMain: true },
      { name: '鸡蛋', quantity: 1, unit: '个', isMain: true },
      { name: '西红柿', quantity: 1, unit: '个', isMain: false },
      { name: '盐', quantity: 1, unit: 'g', isMain: false },
      { name: '黑胡椒', quantity: 1, unit: 'g', isMain: false },
    ],
    steps: [
      '煎鸡蛋一个',
      '牛油果去皮去核后切片',
      '西红柿切片',
      '将牛油果、西红柿和煎蛋放在面包中间',
      '撒上盐和黑胡椒即可',
    ],
    mockId: 203,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['早餐', '三明治', '健康'],
    tags: ['牛油果', '快手'],
    nutritionPerServing: {
      calories: 350,
      protein: 15,
      fat: 20,
      carbs: 30,
      fiber: 8,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '希腊酸奶水果碗',
    description: '清爽美味的健康早餐',
    cookingTime: 5,
    servings: 1,
    ingredients: [
      { name: '希腊酸奶', quantity: 200, unit: 'g', isMain: true },
      { name: '蓝莓', quantity: 50, unit: 'g', isMain: true },
      { name: '草莓', quantity: 50, unit: 'g', isMain: true },
      { name: '香蕉', quantity: 1, unit: '根', isMain: true },
      { name: '蜂蜜', quantity: 15, unit: 'ml', isMain: false },
      { name: '燕麦片', quantity: 20, unit: 'g', isMain: false },
    ],
    steps: [
      '将希腊酸奶倒入碗中',
      '水果洗净，草莓切片，香蕉切块',
      '将水果放在酸奶上',
      '撒上燕麦片',
      '淋上蜂蜜即可',
    ],
    mockId: 204,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['早餐', '甜品', '水果'],
    tags: ['酸奶', '健康'],
    nutritionPerServing: {
      calories: 280,
      protein: 18,
      fat: 2,
      carbs: 45,
      fiber: 6,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '三文鱼藜麦沙拉',
    description: '营养均衡的轻食午餐',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '三文鱼', quantity: 200, unit: 'g', isMain: true },
      { name: '藜麦', quantity: 100, unit: 'g', isMain: true },
      { name: '牛油果', quantity: 1, unit: '个', isMain: true },
      { name: '西红柿', quantity: 1, unit: '个', isMain: false },
      { name: '柠檬汁', quantity: 15, unit: 'ml', isMain: false },
      { name: '橄榄油', quantity: 10, unit: 'ml', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
    ],
    steps: [
      '将藜麦煮熟，冷却备用',
      '三文鱼切小块，用盐和柠檬汁腌制5分钟',
      '西红柿切丁，牛油果去皮去核后切丁',
      '将藜麦、三文鱼、西红柿和牛油果混合',
      '加入橄榄油和柠檬汁调味即可',
    ],
    mockId: 205,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['沙拉', '海鲜', '轻食'],
    tags: ['三文鱼', '藜麦', '健康'],
    nutritionPerServing: {
      calories: 420,
      protein: 30,
      fat: 25,
      carbs: 20,
      fiber: 7,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '青椒肉丝',
    description: '快手炒菜，营养均衡',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '瘦猪肉', quantity: 200, unit: 'g', isMain: true },
      { name: '青椒', quantity: 2, unit: '个', isMain: true },
      { name: '胡萝卜', quantity: 1, unit: '根', isMain: false },
      { name: '大蒜', quantity: 3, unit: '瓣', isMain: false },
      { name: '生抽', quantity: 15, unit: 'ml', isMain: false },
      { name: '食用油', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '猪肉切丝，用少量生抽腌制10分钟',
      '青椒去籽切丝，胡萝卜切丝，大蒜切片',
      '热锅加油，炒香大蒜',
      '放入肉丝翻炒至变色',
      '加入青椒和胡萝卜丝翻炒2分钟',
      '加入生抽调味即可',
    ],
    mockId: 206,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 1,
    categories: ['家常菜', '炒菜', '晚餐'],
    tags: ['快手', '下饭'],
    nutritionPerServing: {
      calories: 280,
      protein: 25,
      fat: 15,
      carbs: 10,
      fiber: 3,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '红豆薏米粥',
    description: '清热祛湿的养生粥品',
    cookingTime: 60,
    servings: 4,
    ingredients: [
      { name: '红豆', quantity: 100, unit: 'g', isMain: true },
      { name: '薏米', quantity: 100, unit: 'g', isMain: true },
      { name: '冰糖', quantity: 30, unit: 'g', isMain: false },
      { name: '清水', quantity: 1500, unit: 'ml', isMain: false },
    ],
    steps: [
      '红豆和薏米提前浸泡4小时',
      '锅中加入清水和浸泡好的红豆，大火煮开',
      '转小火煮30分钟',
      '加入薏米继续煮20分钟',
      '粥变浓稠后加入冰糖搅拌均匀即可',
    ],
    mockId: 207,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['养生', '粥品', '甜品'],
    tags: ['红豆', '薏米', '祛湿'],
    nutritionPerServing: {
      calories: 180,
      protein: 5,
      fat: 1,
      carbs: 40,
      fiber: 5,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '菠菜鸡蛋汤',
    description: '简单营养的家常汤品',
    cookingTime: 10,
    servings: 2,
    ingredients: [
      { name: '菠菜', quantity: 200, unit: 'g', isMain: true },
      { name: '鸡蛋', quantity: 2, unit: '个', isMain: true },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '胡椒粉', quantity: 1, unit: 'g', isMain: false },
      { name: '香油', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '菠菜洗净切段',
      '鸡蛋打散',
      '锅中煮水，水开后放入菠菜',
      '菠菜变色后，转小火，慢慢倒入鸡蛋液并搅拌',
      '加入盐和胡椒粉调味',
      '出锅前淋上几滴香油即可',
    ],
    mockId: 208,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['汤品', '家常菜'],
    tags: ['快手', '营养'],
    nutritionPerServing: {
      calories: 120,
      protein: 10,
      fat: 7,
      carbs: 5,
      fiber: 2,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '秋葵炒虾仁',
    description: '鲜美可口的海鲜蔬菜搭配',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '秋葵', quantity: 250, unit: 'g', isMain: true },
      { name: '虾仁', quantity: 200, unit: 'g', isMain: true },
      { name: '大蒜', quantity: 3, unit: '瓣', isMain: false },
      { name: '姜', quantity: 10, unit: 'g', isMain: false },
      { name: '盐', quantity: 3, unit: 'g', isMain: false },
      { name: '料酒', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '秋葵洗净切段',
      '虾仁洗净，用料酒腌制5分钟',
      '大蒜和姜切末',
      '热锅加油，爆香蒜末和姜末',
      '放入虾仁翻炒至变色',
      '加入秋葵翻炒2分钟',
      '加盐调味即可',
    ],
    mockId: 209,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['海鲜', '炒菜', '晚餐'],
    tags: ['秋葵', '虾仁', '健康'],
    nutritionPerServing: {
      calories: 220,
      protein: 25,
      fat: 8,
      carbs: 12,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '银耳莲子汤',
    description: '滋阴润肺的养生甜品',
    cookingTime: 45,
    servings: 4,
    ingredients: [
      { name: '银耳', quantity: 30, unit: 'g', isMain: true },
      { name: '莲子', quantity: 50, unit: 'g', isMain: true },
      { name: '红枣', quantity: 8, unit: '个', isMain: false },
      { name: '冰糖', quantity: 30, unit: 'g', isMain: false },
      { name: '清水', quantity: 1500, unit: 'ml', isMain: false },
    ],
    steps: [
      '银耳提前泡发，撕成小朵',
      '莲子和红枣洗净',
      '锅中加水，放入银耳、莲子和红枣',
      '大火煮开后转小火煮30分钟',
      '加入冰糖煮至融化即可',
    ],
    mockId: 210,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['甜品', '汤品', '养生'],
    tags: ['银耳', '莲子', '滋补'],
    nutritionPerServing: {
      calories: 120,
      protein: 2,
      fat: 0,
      carbs: 30,
      fiber: 1,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
];

// Part 2 - adding more recipes to the array
recommendationRecipes.push(
  {
    name: '西兰花炒虾仁',
    description: '营养丰富的低脂肪菜肴',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '西兰花', quantity: 300, unit: 'g', isMain: true },
      { name: '虾仁', quantity: 200, unit: 'g', isMain: true },
      { name: '大蒜', quantity: 2, unit: '瓣', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '橄榄油', quantity: 15, unit: 'ml', isMain: false },
    ],
    steps: [
      '西兰花洗净切小朵',
      '虾仁洗净沥干水分',
      '锅中水开后，放入西兰花焯水30秒',
      '热锅加橄榄油，爆香蒜末',
      '放入虾仁翻炒至变色',
      '加入西兰花翻炒2分钟',
      '加盐调味即可',
    ],
    mockId: 211,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['海鲜', '低脂', '炒菜'],
    tags: ['西兰花', '虾仁', '健康'],
    nutritionPerServing: {
      calories: 210,
      protein: 28,
      fat: 9,
      carbs: 10,
      fiber: 5,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '水煮鱼',
    description: '麻辣鲜香的川菜名品',
    cookingTime: 25,
    servings: 3,
    ingredients: [
      { name: '鲈鱼', quantity: 1, unit: '条', isMain: true },
      { name: '豆芽', quantity: 200, unit: 'g', isMain: true },
      { name: '青菜', quantity: 100, unit: 'g', isMain: true },
      { name: '干辣椒', quantity: 10, unit: '个', isMain: false },
      { name: '花椒', quantity: 10, unit: 'g', isMain: false },
      { name: '姜', quantity: 30, unit: 'g', isMain: false },
      { name: '蒜', quantity: 20, unit: 'g', isMain: false },
      { name: '料酒', quantity: 15, unit: 'ml', isMain: false },
      { name: '豆瓣酱', quantity: 20, unit: 'g', isMain: false },
    ],
    steps: [
      '鱼洗净，切片，用盐和料酒腌制10分钟',
      '豆芽和青菜洗净',
      '锅中油热，放入干辣椒和花椒炒香',
      '加入豆瓣酱、姜末和蒜末炒出香味',
      '加入适量水煮开',
      '放入豆芽和青菜煮熟',
      '放入鱼片，煮至变色',
      '淋上热油即可',
    ],
    mockId: 212,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 5,
    categories: ['川菜', '鱼类', '麻辣'],
    tags: ['水煮鱼', '辣', '鲜香'],
    nutritionPerServing: {
      calories: 280,
      protein: 35,
      fat: 12,
      carbs: 8,
      fiber: 3,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '香蕉燕麦饼',
    description: '健康美味的早餐选择',
    cookingTime: 20,
    servings: 4,
    ingredients: [
      { name: '熟香蕉', quantity: 2, unit: '根', isMain: true },
      { name: '燕麦片', quantity: 150, unit: 'g', isMain: true },
      { name: '鸡蛋', quantity: 1, unit: '个', isMain: true },
      { name: '牛奶', quantity: 50, unit: 'ml', isMain: false },
      { name: '蜂蜜', quantity: 15, unit: 'ml', isMain: false },
      { name: '肉桂粉', quantity: 2, unit: 'g', isMain: false },
    ],
    steps: [
      '香蕉压成泥',
      '将燕麦片、香蕉泥、鸡蛋、牛奶、蜂蜜和肉桂粉混合',
      '静置5分钟让燕麦充分吸收水分',
      '平底锅小火加热，舀一勺面糊压扁',
      '两面煎至金黄即可',
    ],
    mockId: 213,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['早餐', '甜点', '烘焙'],
    tags: ['香蕉', '燕麦', '健康'],
    nutritionPerServing: {
      calories: 170,
      protein: 6,
      fat: 3,
      carbs: 35,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '糖醋排骨',
    description: '酸甜可口的经典家常菜',
    cookingTime: 40,
    servings: 3,
    ingredients: [
      { name: '排骨', quantity: 500, unit: 'g', isMain: true },
      { name: '白糖', quantity: 50, unit: 'g', isMain: false },
      { name: '醋', quantity: 30, unit: 'ml', isMain: false },
      { name: '酱油', quantity: 15, unit: 'ml', isMain: false },
      { name: '姜', quantity: 20, unit: 'g', isMain: false },
      { name: '葱', quantity: 20, unit: 'g', isMain: false },
      { name: '料酒', quantity: 15, unit: 'ml', isMain: false },
    ],
    steps: [
      '排骨洗净，切段，焯水去血沫',
      '锅中油热，放入排骨煎至两面金黄',
      '加入白糖炒至融化变色',
      '加入醋、酱油、料酒、姜片和葱段',
      '加入适量水烧开',
      '转小火炖20分钟',
      '大火收汁即可',
    ],
    mockId: 214,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 1,
    categories: ['家常菜', '肉类', '炖菜'],
    tags: ['糖醋', '排骨', '下饭'],
    nutritionPerServing: {
      calories: 380,
      protein: 25,
      fat: 22,
      carbs: 20,
      fiber: 0,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '清蒸鲈鱼',
    description: '鲜嫩可口的健康蒸菜',
    cookingTime: 20,
    servings: 2,
    ingredients: [
      { name: '鲈鱼', quantity: 1, unit: '条', isMain: true },
      { name: '姜', quantity: 20, unit: 'g', isMain: false },
      { name: '葱', quantity: 30, unit: 'g', isMain: false },
      { name: '料酒', quantity: 15, unit: 'ml', isMain: false },
      { name: '酱油', quantity: 15, unit: 'ml', isMain: false },
      { name: '香油', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '鱼洗净，在两侧各划三刀',
      '腌制鱼：抹上盐和料酒，腌制10分钟',
      '姜切丝，葱切段',
      '蒸锅水开后，放入鱼蒸8-10分钟',
      '取出鱼，撒上姜丝和葱段',
      '锅中油热，淋在姜葱上',
      '淋上酱油和香油即可',
    ],
    mockId: 215,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['海鲜', '蒸菜', '健康'],
    tags: ['鲈鱼', '清蒸', '低脂'],
    nutritionPerServing: {
      calories: 220,
      protein: 30,
      fat: 10,
      carbs: 2,
      fiber: 0,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '蔬菜炒面',
    description: '营养均衡的快手主食',
    cookingTime: 15,
    servings: 1,
    ingredients: [
      { name: '面条', quantity: 100, unit: 'g', isMain: true },
      { name: '胡萝卜', quantity: 1, unit: '根', isMain: true },
      { name: '青椒', quantity: 1, unit: '个', isMain: true },
      { name: '洋葱', quantity: 1 / 2, unit: '个', isMain: true },
      { name: '鸡蛋', quantity: 1, unit: '个', isMain: true },
      { name: '酱油', quantity: 10, unit: 'ml', isMain: false },
      { name: '蚝油', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '面条煮熟，过冷水备用',
      '胡萝卜、青椒、洋葱切丝',
      '鸡蛋打散',
      '热锅加油，倒入鸡蛋液炒散',
      '放入蔬菜丝翻炒1分钟',
      '加入面条、酱油和蚝油翻炒均匀即可',
    ],
    mockId: 216,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['面食', '快手菜', '炒菜'],
    tags: ['炒面', '蔬菜', '一人食'],
    nutritionPerServing: {
      calories: 420,
      protein: 15,
      fat: 10,
      carbs: 70,
      fiber: 5,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '豆浆',
    description: '自制营养早餐饮品',
    cookingTime: 30,
    servings: 4,
    ingredients: [
      { name: '黄豆', quantity: 200, unit: 'g', isMain: true },
      { name: '清水', quantity: 1500, unit: 'ml', isMain: false },
      { name: '白糖', quantity: 20, unit: 'g', isMain: false },
    ],
    steps: [
      '黄豆提前浸泡8小时',
      '黄豆和适量水放入豆浆机',
      '启动豆浆机制作豆浆',
      '煮沸后加入白糖调味即可',
    ],
    mockId: 217,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['饮品', '早餐', '豆制品'],
    tags: ['豆浆', '健康', '自制'],
    nutritionPerServing: {
      calories: 120,
      protein: 9,
      fat: 6,
      carbs: 12,
      fiber: 2,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '紫菜蛋花汤',
    description: '简单美味的家常汤品',
    cookingTime: 10,
    servings: 2,
    ingredients: [
      { name: '紫菜', quantity: 10, unit: 'g', isMain: true },
      { name: '鸡蛋', quantity: 1, unit: '个', isMain: true },
      { name: '香葱', quantity: 5, unit: 'g', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '鸡精', quantity: 2, unit: 'g', isMain: false },
      { name: '香油', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '紫菜洗净撕碎，香葱切末',
      '鸡蛋打散',
      '锅中水烧开后放入紫菜',
      '边搅拌边慢慢倒入蛋液',
      '加入盐和鸡精调味',
      '出锅前撒上葱花，淋上香油即可',
    ],
    mockId: 218,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['汤品', '家常菜', '快手菜'],
    tags: ['紫菜', '蛋花', '简单'],
    nutritionPerServing: {
      calories: 70,
      protein: 6,
      fat: 4,
      carbs: 3,
      fiber: 1,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '燕麦牛奶',
    description: '简单营养的早餐饮品',
    cookingTime: 5,
    servings: 1,
    ingredients: [
      { name: '燕麦片', quantity: 50, unit: 'g', isMain: true },
      { name: '牛奶', quantity: 250, unit: 'ml', isMain: true },
      { name: '蜂蜜', quantity: 10, unit: 'ml', isMain: false },
      { name: '坚果碎', quantity: 10, unit: 'g', isMain: false },
    ],
    steps: [
      '燕麦片放入碗中',
      '牛奶加热至温热',
      '倒入燕麦片中搅拌均匀',
      '加入蜂蜜调味',
      '撒上坚果碎即可',
    ],
    mockId: 219,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['早餐', '饮品', '冷食'],
    tags: ['燕麦', '牛奶', '简单'],
    nutritionPerServing: {
      calories: 300,
      protein: 12,
      fat: 8,
      carbs: 45,
      fiber: 5,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '鸡胸肉沙拉',
    description: '高蛋白低脂肪的健身餐',
    cookingTime: 20,
    servings: 1,
    ingredients: [
      { name: '鸡胸肉', quantity: 150, unit: 'g', isMain: true },
      { name: '生菜', quantity: 100, unit: 'g', isMain: true },
      { name: '西红柿', quantity: 1, unit: '个', isMain: true },
      { name: '黄瓜', quantity: 1, unit: '根', isMain: true },
      { name: '橄榄油', quantity: 10, unit: 'ml', isMain: false },
      { name: '柠檬汁', quantity: 5, unit: 'ml', isMain: false },
      { name: '盐', quantity: 2, unit: 'g', isMain: false },
      { name: '黑胡椒', quantity: 2, unit: 'g', isMain: false },
    ],
    steps: [
      '鸡胸肉煮熟，撕成小块',
      '生菜撕碎，西红柿和黄瓜切小块',
      '将所有蔬菜和鸡胸肉放入大碗中',
      '加入橄榄油、柠檬汁、盐和黑胡椒',
      '混合均匀即可',
    ],
    mockId: 220,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['沙拉', '健身餐', '高蛋白'],
    tags: ['鸡胸肉', '减脂', '健康'],
    nutritionPerServing: {
      calories: 330,
      protein: 40,
      fat: 15,
      carbs: 10,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
);

// Part 3 - adding the final set of recipes
recommendationRecipes.push(
  {
    name: '芦笋虾仁意面',
    description: '鲜美可口的西式简餐',
    cookingTime: 20,
    servings: 2,
    ingredients: [
      { name: '意大利面', quantity: 200, unit: 'g', isMain: true },
      { name: '虾仁', quantity: 150, unit: 'g', isMain: true },
      { name: '芦笋', quantity: 100, unit: 'g', isMain: true },
      { name: '大蒜', quantity: 3, unit: '瓣', isMain: false },
      { name: '橄榄油', quantity: 20, unit: 'ml', isMain: false },
      { name: '盐', quantity: 3, unit: 'g', isMain: false },
      { name: '黑胡椒', quantity: 2, unit: 'g', isMain: false },
      { name: '柠檬汁', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '意大利面煮熟，保留少量面汤',
      '芦笋切段，大蒜切末',
      '锅中热油，炒香蒜末',
      '加入虾仁煸炒至变色',
      '加入芦笋翻炒2分钟',
      '放入煮好的面条，加入少量面汤',
      '加入盐、黑胡椒调味',
      '淋上柠檬汁即可',
    ],
    mockId: 221,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['意面', '西餐', '海鲜'],
    tags: ['芦笋', '虾仁', '简餐'],
    nutritionPerServing: {
      calories: 420,
      protein: 25,
      fat: 12,
      carbs: 60,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '冬瓜排骨汤',
    description: '清爽鲜美的家常汤品',
    cookingTime: 50,
    servings: 4,
    ingredients: [
      { name: '排骨', quantity: 500, unit: 'g', isMain: true },
      { name: '冬瓜', quantity: 400, unit: 'g', isMain: true },
      { name: '姜', quantity: 20, unit: 'g', isMain: false },
      { name: '枸杞', quantity: 10, unit: 'g', isMain: false },
      { name: '盐', quantity: 5, unit: 'g', isMain: false },
    ],
    steps: [
      '排骨洗净，焯水去血沫',
      '冬瓜去皮去瓤，切块',
      '姜切片',
      '锅中加入清水和排骨，大火煮开',
      '转小火煮30分钟',
      '加入冬瓜继续煮15分钟',
      '快出锅时加入盐和枸杞调味即可',
    ],
    mockId: 222,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['汤品', '家常菜', '排骨'],
    tags: ['冬瓜', '清热', '滋补'],
    nutritionPerServing: {
      calories: 220,
      protein: 20,
      fat: 15,
      carbs: 5,
      fiber: 2,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '香菇青菜',
    description: '简单健康的素食菜肴',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '香菇', quantity: 200, unit: 'g', isMain: true },
      { name: '青菜', quantity: 300, unit: 'g', isMain: true },
      { name: '大蒜', quantity: 3, unit: '瓣', isMain: false },
      { name: '盐', quantity: 3, unit: 'g', isMain: false },
      { name: '生抽', quantity: 10, unit: 'ml', isMain: false },
    ],
    steps: [
      '香菇洗净，切片',
      '青菜洗净，切段',
      '大蒜切末',
      '锅中热油，爆香蒜末',
      '放入香菇翻炒2分钟',
      '加入青菜翻炒至变软',
      '加入盐和生抽调味即可',
    ],
    mockId: 223,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['素食', '炒菜', '家常菜'],
    tags: ['香菇', '青菜', '简单'],
    nutritionPerServing: {
      calories: 120,
      protein: 5,
      fat: 2,
      carbs: 20,
      fiber: 6,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '黄瓜凉拌豆腐',
    description: '清爽开胃的夏季凉菜',
    cookingTime: 10,
    servings: 2,
    ingredients: [
      { name: '豆腐', quantity: 300, unit: 'g', isMain: true },
      { name: '黄瓜', quantity: 1, unit: '根', isMain: true },
      { name: '蒜', quantity: 2, unit: '瓣', isMain: false },
      { name: '香菜', quantity: 10, unit: 'g', isMain: false },
      { name: '生抽', quantity: 10, unit: 'ml', isMain: false },
      { name: '香醋', quantity: 5, unit: 'ml', isMain: false },
      { name: '香油', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '豆腐切丁，用沸水焯一下，捞出沥干水分',
      '黄瓜切丁',
      '蒜末和香菜末备用',
      '将豆腐和黄瓜放入碗中',
      '加入生抽、香醋、香油、蒜末和香菜末',
      '拌匀即可',
    ],
    mockId: 224,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 0,
    categories: ['凉菜', '素食', '豆制品'],
    tags: ['黄瓜', '豆腐', '开胃'],
    nutritionPerServing: {
      calories: 150,
      protein: 12,
      fat: 8,
      carbs: 8,
      fiber: 2,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
  {
    name: '木耳炒肉',
    description: '营养均衡的家常小炒',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '黑木耳', quantity: 50, unit: 'g', isMain: true },
      { name: '猪肉', quantity: 150, unit: 'g', isMain: true },
      { name: '青椒', quantity: 1, unit: '个', isMain: false },
      { name: '红椒', quantity: 1, unit: '个', isMain: false },
      { name: '姜', quantity: 10, unit: 'g', isMain: false },
      { name: '蒜', quantity: 3, unit: '瓣', isMain: false },
      { name: '生抽', quantity: 10, unit: 'ml', isMain: false },
      { name: '料酒', quantity: 5, unit: 'ml', isMain: false },
    ],
    steps: [
      '黑木耳提前泡发，洗净',
      '猪肉切片，用生抽和料酒腌制10分钟',
      '青椒和红椒切丝，姜蒜切末',
      '热锅加油，爆香姜蒜',
      '放入肉片翻炒至变色',
      '加入木耳和青红椒丝翻炒2分钟',
      '加入调料翻炒均匀即可',
    ],
    mockId: 225,
    imageUrl: '/assets/food-placeholder.svg',
    spiceLevel: 1,
    categories: ['炒菜', '家常菜', '肉类'],
    tags: ['木耳', '下饭', '快手'],
    nutritionPerServing: {
      calories: 220,
      protein: 18,
      fat: 10,
      carbs: 15,
      fiber: 4,
    },
    isPersonal: false,
    createdBy: '000000000000000000000001',
  },
);

// 导入推荐食谱数据
const seedRecommendationRecipes = async () => {
  try {
    // 获取所有mockId，用于清空已存在的模拟数据
    const mockIds = recommendationRecipes.map((recipe) => recipe.mockId);

    // 清空已存在的mockId食谱数据，避免重复
    await Recipe.deleteMany({
      mockId: { $in: mockIds },
    });
    console.log('已清空现有模拟推荐食谱数据');

    // 批量插入新食谱
    await Recipe.insertMany(recommendationRecipes);
    console.log(
      `成功导入${recommendationRecipes.length}个推荐食谱数据到数据库`,
    );
  } catch (error) {
    console.error('导入推荐食谱数据失败:', error);
  }
};

// 运行导入函数
const runSeed = async () => {
  try {
    await connectDB();
    await seedRecommendationRecipes();
    console.log('所有推荐食谱数据导入完成');
    process.exit(0);
  } catch (error) {
    console.error('运行导入脚本失败:', error);
    process.exit(1);
  }
};

runSeed();
