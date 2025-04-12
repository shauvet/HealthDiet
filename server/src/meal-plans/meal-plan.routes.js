const express = require('express');
const router = express.Router();
const MealPlanController = require('./meal-plan.controller');

// 获取膳食计划
router.get('/', MealPlanController.getMealPlans);
router.get('/current-week', MealPlanController.getCurrentWeekMealPlans);
router.get('/date/:date', MealPlanController.getDailyMealPlan);
router.get('/most-frequent', MealPlanController.getMostFrequentRecipes);
router.get('/distribution', MealPlanController.getMealTypeDistribution);
router.get('/:id', MealPlanController.getMealPlanById);
router.get(
  '/:id/ingredients/check',
  MealPlanController.checkIngredientAvailability,
);

// 添加和修改膳食计划
router.post('/', MealPlanController.addMealPlan);
router.post('/generate', MealPlanController.generateMealPlans);
router.put('/:id', MealPlanController.updateMealPlan);
router.delete('/:id', MealPlanController.removeMealPlan);
router.patch('/:id/complete', MealPlanController.markAsCompleted);

module.exports = router;
