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

module.exports = router;
