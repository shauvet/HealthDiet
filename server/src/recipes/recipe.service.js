const RecipeRepository = require('./repositories/recipe.repository');

const RecipeService = {
  // 获取所有食谱，支持分页和筛选
  async getRecipes(filters = {}, page = 1, limit = 10) {
    console.log(
      'RecipeService.getRecipes called with filters:',
      JSON.stringify(filters),
    );
    const result = await RecipeRepository.getRecipes(filters, page, limit);
    console.log('RecipeService.getRecipes result:', { total: result.total });
    return result;
  },

  // 根据ID获取食谱详情
  async getRecipeById(id) {
    return await RecipeRepository.getRecipeById(id);
  },

  // 创建新食谱
  async createRecipe(recipeData) {
    return await RecipeRepository.createRecipe(recipeData);
  },

  // 更新食谱
  async updateRecipe(id, updateData) {
    return await RecipeRepository.updateRecipe(id, updateData);
  },

  // 删除食谱
  async deleteRecipe(id) {
    return await RecipeRepository.deleteRecipe(id);
  },

  // 搜索食谱
  async searchRecipes(searchTerm) {
    return await RecipeRepository.searchRecipes(searchTerm);
  },

  // 获取推荐食谱
  async getRecommendedRecipes(userId, limit = 30) {
    return await RecipeRepository.getRecommendedRecipes(userId, limit);
  },

  // 获取用户的个人食谱
  async getUserRecipes(userId) {
    return await RecipeRepository.getUserRecipes(userId);
  },

  // 收藏食谱
  async favoriteRecipe(userId, recipeId, notes = '') {
    return await RecipeRepository.favoriteRecipe(userId, recipeId, notes);
  },

  // 取消收藏
  async unfavoriteRecipe(userId, recipeId) {
    return await RecipeRepository.unfavoriteRecipe(userId, recipeId);
  },

  // 获取用户收藏的食谱
  async getUserFavorites(userId) {
    return await RecipeRepository.getUserFavorites(userId);
  },

  // 检查用户是否已收藏食谱
  async isRecipeFavorited(userId, recipeId) {
    return await RecipeRepository.isRecipeFavorited(userId, recipeId);
  },

  // 获取基于特定食材的食谱
  async getRecipesByIngredients(ingredientNames, limit = 10) {
    return await RecipeRepository.getRecipesByIngredients(
      ingredientNames,
      limit,
    );
  },

  // 获取类似食谱
  async getSimilarRecipes(recipeId, limit = 3) {
    return await RecipeRepository.getSimilarRecipes(recipeId, limit);
  },

  // 根据膳食类型获取食谱（早餐、午餐、晚餐）
  async getRecipesByMealType(mealType, limit = 10) {
    return await RecipeRepository.getRecipes(
      { categories: [mealType] },
      1,
      limit,
    ).then((result) => result.data);
  },

  // 根据难度等级获取食谱
  async getRecipesByDifficulty(difficulty, limit = 10) {
    return await RecipeRepository.getRecipes({ difficulty }, 1, limit).then(
      (result) => result.data,
    );
  },

  // 根据烹饪时间获取食谱
  async getRecipesByCookingTime(maxTime, limit = 10) {
    return await RecipeRepository.getRecipes(
      { cookingTime: maxTime },
      1,
      limit,
    ).then((result) => result.data);
  },

  // 根据食谱类型获取食谱（例如：素食、低脂等）
  async getRecipesByType(type, limit = 10) {
    return await RecipeRepository.getRecipes(
      { categories: [type] },
      1,
      limit,
    ).then((result) => result.data);
  },

  // 更新食谱食材
  async updateRecipeIngredients(recipeId, ingredients) {
    return await RecipeRepository.updateRecipeIngredients(
      recipeId,
      ingredients,
    );
  },
};

module.exports = RecipeService;
