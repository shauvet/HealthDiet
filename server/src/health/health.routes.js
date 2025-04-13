const express = require('express');
const router = express.Router();
const HealthController = require('./health.controller');

// 获取所有健康分析数据
router.get('/all', HealthController.getAllHealthData);

// 获取日均营养摄入数据
router.get('/nutrition/daily', HealthController.getNutrientData);

// 获取营养摄入趋势数据
router.get('/nutrition/trends', HealthController.getNutritionTrends);

// 获取维生素摄入数据
router.get('/nutrition/vitamins', HealthController.getVitaminIntake);

// 获取矿物质摄入数据
router.get('/nutrition/minerals', HealthController.getMineralIntake);

// 获取饮食结构数据
router.get('/diet/structure', HealthController.getDietStructure);

// 从已点菜单获取营养数据
router.get('/nutrition/mealplans', HealthController.getMealPlanNutritionData);

// 更新营养目标
router.post('/nutrition/goals', HealthController.updateNutritionGoals);

// 添加每日营养数据
router.post('/nutrition/daily', HealthController.addDailyNutrition);

// 测试TianAPI调用
router.get('/test-tianapi', HealthController.testTianApi);

module.exports = router;
