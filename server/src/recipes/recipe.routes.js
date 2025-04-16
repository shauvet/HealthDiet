const express = require('express');
const router = express.Router();
const RecipeController = require('./recipe.controller');
const RecipeRepository = require('./repositories/recipe.repository');

// 获取和搜索食谱
router.get('/', RecipeController.getRecipes);
router.get('/search', RecipeController.searchRecipes);
router.get('/recommended', RecipeController.getRecommendedRecipesNew);
router.get('/user', RecipeController.getUserRecipes);
router.get('/personal', RecipeController.getPersonalRecipes);
router.get('/favorites', RecipeController.getUserFavorites);
router.get('/by-ingredients', RecipeController.getRecipesByIngredients);
router.get('/by-meal-type/:mealType', RecipeController.getRecipesByMealType);
router.get('/similar/:recipeId', RecipeController.getSimilarRecipes);
router.get('/:id', RecipeController.getRecipeById);
router.get('/:recipeId/is-favorited', RecipeController.isRecipeFavorited);

// 创建和管理食谱
router.post('/', RecipeController.createRecipe);
router.put('/:id', RecipeController.updateRecipe);
router.delete('/:id', RecipeController.deleteRecipe);
// 新增：更新食谱食材
router.patch('/:id/ingredients', RecipeController.updateRecipeIngredients);

// 收藏相关操作
router.post('/:recipeId/favorite', RecipeController.favoriteRecipe);
router.delete('/:recipeId/favorite', RecipeController.unfavoriteRecipe);

// 添加清除缓存路由
router.post('/cache/clear', (req, res) => {
  try {
    RecipeRepository.invalidateAllRecommendedCache();
    res.json({ success: true, message: '成功清除食谱缓存' });
  } catch (error) {
    console.error('清除缓存时出错:', error);
    res.status(500).json({ error: '清除缓存失败' });
  }
});

module.exports = router;
