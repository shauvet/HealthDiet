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
    try {
      console.log(`尝试将食谱 ${recipeId} 添加到 ${userId} 的收藏中`);

      // 直接创建收藏记录，不做任何类型转换
      const favorite = new FavoriteRecipe({
        userId,
        recipeId, // 直接使用传入的recipeId，无论它是字符串还是ObjectId
        notes,
        // 如果是数字ID，也记录在mockRecipeId字段
        ...(!isNaN(parseInt(recipeId)) && { mockRecipeId: parseInt(recipeId) }),
      });

      // 保存收藏
      return await favorite.save();
    } catch (error) {
      console.error('Error in favoriteRecipe:', error);
      throw error;
    }
  }

  // 取消收藏
  async unfavoriteRecipe(userId, recipeId) {
    try {
      console.log(`尝试取消收藏食谱 ${recipeId}`);

      // 直接查找并删除收藏记录
      return await FavoriteRecipe.findOneAndDelete({
        userId,
        recipeId,
      });
    } catch (error) {
      console.error('Error in unfavoriteRecipe:', error);
      throw error;
    }
  }

  // 获取用户收藏的食谱
  async getUserFavorites(userId) {
    try {
      console.log(`获取用户 ${userId} 的收藏食谱列表`);

      // 查询所有收藏记录
      const favorites = await FavoriteRecipe.find({ userId }).sort({
        createdAt: -1,
      });

      // 获取收藏食谱的详细信息
      const result = [];
      for (const fav of favorites) {
        let recipeDetails = {
          id: fav.recipeId,
          favoriteId: fav._id,
          notes: fav.notes,
          createdAt: fav.createdAt,
          // 默认信息，当找不到食谱详情时使用
          name: '未知食谱',
          cookingTime: 30,
          imageUrl: '/assets/food-placeholder.svg',
          spiceLevel: 0,
        };

        try {
          // 对于非数字ID（即MongoDB ObjectId），尝试从Recipe集合获取详情
          if (mongoose.Types.ObjectId.isValid(fav.recipeId)) {
            const recipe = await Recipe.findById(fav.recipeId);
            if (recipe) {
              recipeDetails.name = recipe.name;
              recipeDetails.cookingTime = recipe.cookingTime;
              recipeDetails.imageUrl = recipe.imageUrl;
              recipeDetails.spiceLevel = recipe.spiceLevel;
            }
          }
          // 对于数字ID（模拟数据），尝试获取对应的模拟食谱数据
          else if (fav.mockRecipeId) {
            // 这里可以添加模拟数据的获取逻辑，或者维护一个基本的食谱名称映射
            const mockRecipes = {
              1: '番茄炒蛋',
              2: '红烧肉',
              3: '清蒸鱼',
              4: '麻婆豆腐',
              5: '小笼包',
              6: '宫保鸡丁',
            };
            if (mockRecipes[fav.mockRecipeId]) {
              recipeDetails.name = mockRecipes[fav.mockRecipeId];
            }
          }
        } catch (err) {
          console.error(`获取食谱 ${fav.recipeId} 详情失败:`, err);
          // 继续使用默认值
        }

        result.push(recipeDetails);
      }

      return result;
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      return [];
    }
  }

  // 检查用户是否已收藏食谱
  async isRecipeFavorited(userId, recipeId) {
    try {
      console.log(`检查用户 ${userId} 是否已收藏食谱 ${recipeId}`);
      const favorite = await FavoriteRecipe.findOne({
        userId,
        recipeId,
      });
      return !!favorite;
    } catch (error) {
      console.error('Error in isRecipeFavorited:', error);
      return false;
    }
  }

  // 更新食谱食材
  async updateRecipeIngredients(recipeId, ingredients) {
    try {
      console.log(`更新食谱 ${recipeId} 的食材列表`, { ingredients });

      // Handle different ID formats
      let query = {};

      // If recipeId is a valid ObjectId, use it directly
      if (
        mongoose.Types.ObjectId.isValid(recipeId) &&
        /^[0-9a-fA-F]{24}$/.test(recipeId)
      ) {
        query._id = recipeId;
      }
      // For numeric IDs (like "1", "2", etc.)
      else if (!isNaN(parseInt(recipeId))) {
        // Use the mockId field for numeric IDs
        query.mockId = parseInt(recipeId);
      } else {
        // If ID is neither valid ObjectId nor numeric, use the string as is
        query._id = recipeId;
      }

      console.log('查询条件:', JSON.stringify(query));

      // First try to find the recipe to check if it exists
      const existingRecipe = await Recipe.findOne(query);
      console.log('现有食谱:', existingRecipe ? 'Found' : 'Not found');

      // If the recipe doesn't exist and it's a numeric ID, create a new recipe
      if (!existingRecipe && !isNaN(parseInt(recipeId))) {
        console.log(`Creating new recipe with mockId ${recipeId}`);
        // Create minimal recipe with the mockId and ingredients
        const newRecipe = new Recipe({
          name: `Recipe ${recipeId}`,
          description: '',
          cookingTime: 30,
          servings: 2,
          ingredients,
          steps: ['将食材混合在一起'], // Add a default non-empty step to pass validation
          mockId: parseInt(recipeId),
          createdBy: '000000000000000000000001', // Default user ID
        });

        const savedRecipe = await newRecipe.save();
        console.log(`新建食谱成功: ${savedRecipe._id}`);
        return savedRecipe;
      }

      // If recipe exists, update it
      if (existingRecipe) {
        const updatedRecipe = await Recipe.findOneAndUpdate(
          query,
          { $set: { ingredients } },
          { new: true }, // 返回更新后的文档
        );

        if (!updatedRecipe) {
          console.log(`未找到食谱 ${recipeId}`);
          return null;
        }

        console.log(`更新食谱成功: ${updatedRecipe._id}`);
        return updatedRecipe;
      }

      return null;
    } catch (error) {
      console.error('Error in updateRecipeIngredients:', error);
      // Add more detailed error logging
      if (error.name === 'CastError') {
        console.error('CastError Details:', {
          value: error.value,
          path: error.path,
          kind: error.kind,
          model: error.model?.modelName,
          reason: error.reason?.message,
        });
      }
      throw error;
    }
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
