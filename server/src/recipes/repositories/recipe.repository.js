const mongoose = require('mongoose');
const { RecipeSchema } = require('../schemas/recipe.schema');
const { FavoriteRecipeSchema } = require('../schemas/favorite-recipe.schema');

// 创建模型
const Recipe = mongoose.model('Recipe', RecipeSchema);
const FavoriteRecipe = mongoose.model('FavoriteRecipe', FavoriteRecipeSchema);

class RecipeRepository {
  // 获取所有食谱，支持分页和筛选
  async getRecipes(filters = {}, page = 1, limit = 10) {
    const query = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.cuisine) {
      query.cuisine = filters.cuisine;
    }

    if (filters.cookingTime) {
      query.cookingTime = { $lte: parseInt(filters.cookingTime) };
    }

    if (filters.spiceLevel !== undefined) {
      query.spiceLevel = parseInt(filters.spiceLevel);
    }

    if (filters.categories && filters.categories.length > 0) {
      query.categories = { $in: filters.categories };
    }

    if (filters.createdBy) {
      query.createdBy = filters.createdBy;
    }

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Recipe.countDocuments(query),
    ]);

    return {
      data: recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 根据ID获取食谱详情
  async getRecipeById(id) {
    return await Recipe.findById(id).exec();
  }

  // 创建新食谱
  async createRecipe(recipeData) {
    const recipe = new Recipe(recipeData);
    return await recipe.save();
  }

  // 更新食谱
  async updateRecipe(id, updateData) {
    return await Recipe.findByIdAndUpdate(id, updateData, { new: true });
  }

  // 删除食谱
  async deleteRecipe(id) {
    return await Recipe.findByIdAndDelete(id);
  }

  // 搜索食谱
  async searchRecipes(searchTerm) {
    return await Recipe.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { 'ingredients.name': { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    }).limit(20);
  }

  // 获取推荐食谱
  async getRecommendedRecipes(userId, limit = 6) {
    // 这里可以基于用户的历史记录、偏好等进行推荐
    // 简单实现：随机推荐几个食谱
    return await Recipe.aggregate([{ $sample: { size: limit } }]);
  }

  // 获取用户的个人食谱
  async getUserRecipes(userId) {
    return await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  // 收藏食谱
  async favoriteRecipe(userId, recipeId, notes = '') {
    const favoriteData = {
      userId,
      recipeId,
      notes,
    };

    // 使用upsert确保不会重复收藏
    return await FavoriteRecipe.findOneAndUpdate(
      { userId, recipeId },
      favoriteData,
      { upsert: true, new: true },
    );
  }

  // 取消收藏
  async unfavoriteRecipe(userId, recipeId) {
    return await FavoriteRecipe.findOneAndDelete({ userId, recipeId });
  }

  // 获取用户收藏的食谱
  async getUserFavorites(userId) {
    const favorites = await FavoriteRecipe.find({ userId })
      .populate('recipeId')
      .sort({ createdAt: -1 });

    // 转换为前端所需的格式
    return favorites
      .map((fav) => {
        const recipe = fav.recipeId;
        if (!recipe) return null; // 处理被删除的食谱

        return {
          id: recipe._id,
          name: recipe.name,
          cookingTime: recipe.cookingTime,
          imageUrl: recipe.imageUrl,
          cuisineId: recipe.cuisine,
          mealType:
            recipe.categories.find((c) =>
              ['breakfast', 'lunch', 'dinner', 'snack'].includes(c),
            ) || null,
          spiceLevel: recipe.spiceLevel,
          favoriteId: fav._id,
          notes: fav.notes,
        };
      })
      .filter(Boolean); // 过滤掉null值
  }

  // 检查用户是否已收藏食谱
  async isRecipeFavorited(userId, recipeId) {
    const favorite = await FavoriteRecipe.findOne({ userId, recipeId });
    return !!favorite;
  }

  // 获取基于特定食材的食谱
  async getRecipesByIngredients(ingredientNames, limit = 10) {
    return await Recipe.find({
      'ingredients.name': { $in: ingredientNames },
    }).limit(limit);
  }

  // 获取类似食谱
  async getSimilarRecipes(recipeId, limit = 3) {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) return [];

    // 基于相同的菜系、主要食材或标签来查找类似的食谱
    return await Recipe.find({
      _id: { $ne: recipeId }, // 排除当前食谱
      $or: [
        { cuisine: recipe.cuisine },
        { categories: { $in: recipe.categories } },
        { 'ingredients.name': { $in: recipe.ingredients.map((i) => i.name) } },
      ],
    }).limit(limit);
  }
}

module.exports = new RecipeRepository();
