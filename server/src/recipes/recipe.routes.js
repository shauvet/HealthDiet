const express = require('express');
const router = express.Router();
const RecipeController = require('./recipe.controller');

// 获取和搜索食谱
router.get('/', RecipeController.getRecipes);
router.get('/search', RecipeController.searchRecipes);
router.get('/recommended', RecipeController.getRecommendedRecipes);
router.get('/user', RecipeController.getUserRecipes);
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

// 收藏相关操作
router.post('/:recipeId/favorite', RecipeController.favoriteRecipe);
router.delete('/:recipeId/favorite', RecipeController.unfavoriteRecipe);

module.exports = router;
