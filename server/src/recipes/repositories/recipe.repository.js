const mongoose = require('mongoose');
const { RecipeSchema } = require('../schemas/recipe.schema');
const { FavoriteRecipeSchema } = require('../schemas/favorite-recipe.schema');
const cache = require('../../utils/cache');

// 创建模型
const Recipe = mongoose.model('Recipe', RecipeSchema);
const FavoriteRecipe = mongoose.model('FavoriteRecipe', FavoriteRecipeSchema);

// 缓存过期时间（毫秒）- 24小时
const CACHE_TTL = 24 * 60 * 60 * 1000;

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
    try {
      console.log(`获取食谱详情: ${id}`);

      // Handle different ID formats
      let query = {};

      // If id is a valid ObjectId, use it directly
      if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
        query._id = mongoose.Types.ObjectId(id);
      }
      // For numeric IDs (like "1", "2", etc.)
      else if (!isNaN(parseInt(id))) {
        // Use the mockId field for numeric IDs
        query.mockId = parseInt(id);
      } else {
        // If ID is neither valid ObjectId nor numeric, use the string as is
        query._id = id;
      }

      console.log('查询条件:', JSON.stringify(query));

      // Try to find the recipe in the database
      const recipe = await Recipe.findOne(query);

      if (recipe) {
        console.log(`找到食谱: ${recipe.name}`);
        return recipe;
      }

      console.log(`在数据库中未找到ID为 ${id} 的食谱`);
      return null;
    } catch (error) {
      console.error('Error in getRecipeById:', error);
      throw error;
    }
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
    try {
      // 生成缓存键（结合用户ID和限制数量）
      const cacheKey = `recommended_recipes_${userId}_${limit}`;

      // 检查缓存中是否已存在结果
      if (cache.has(cacheKey)) {
        console.log(`[缓存命中] 返回用户 ${userId} 的缓存推荐食谱`);
        return cache.get(cacheKey);
      }

      console.log(`[缓存未命中] 为用户 ${userId} 生成新的推荐食谱`);

      // 获取推荐食谱（随机抽样）
      const recipes = await Recipe.aggregate([{ $sample: { size: limit } }]);

      // 查找用户的所有收藏，用于检查食谱是否已收藏
      const favorites = await FavoriteRecipe.find({ userId }).lean();
      const favoriteIds = favorites.map((fav) => fav.recipeId.toString());

      // 标记每个食谱的收藏状态
      const recipesWithFavoriteStatus = recipes.map((recipe) => {
        const recipeObj = recipe;
        const isRecipeFavorited = favoriteIds.includes(recipe._id.toString());
        // 添加isFavorite属性
        recipeObj.isFavorite = isRecipeFavorited;

        // 如果已收藏，添加favoriteId
        if (isRecipeFavorited) {
          const favorite = favorites.find(
            (fav) => fav.recipeId.toString() === recipe._id.toString(),
          );
          if (favorite) {
            recipeObj.favoriteId = favorite._id;
          }
        }

        return recipeObj;
      });

      // 将结果存入缓存
      cache.set(cacheKey, recipesWithFavoriteStatus, CACHE_TTL);

      return recipesWithFavoriteStatus;
    } catch (error) {
      console.error('Error in getRecommendedRecipes:', error);
      // 如果出错，返回无收藏状态的食谱
      return await Recipe.aggregate([{ $sample: { size: limit } }]);
    }
  }

  // 获取用户的个人食谱
  async getUserRecipes(userId) {
    return await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  // 收藏食谱
  async favoriteRecipe(userId, recipeId, notes = '') {
    try {
      console.log(`尝试将食谱 ${recipeId} 添加到 ${userId} 的收藏中`);

      // 检查recipeId是否有效，并进行标准化处理
      if (!recipeId || recipeId === 'undefined' || recipeId === 'null') {
        console.error(`无效的recipeId: ${recipeId}`);
        throw new Error('Invalid recipe ID');
      }

      // 尝试查找食谱以确认其存在
      let recipeExists = false;
      let mockRecipeId = null;
      let recipeIdForSaving = recipeId; // 默认使用传入的ID

      // 对于MongoDB ObjectId格式的ID
      if (
        mongoose.Types.ObjectId.isValid(recipeId) &&
        /^[0-9a-fA-F]{24}$/.test(recipeId)
      ) {
        console.log('MongoDB ID格式有效，尝试查找食谱');
        const recipe = await Recipe.findById(recipeId);
        if (recipe) {
          recipeExists = true;
          console.log(`找到食谱: ${recipe.name}`);

          // 如果找到食谱并且它有mockId，记录下来
          if (recipe.mockId && !isNaN(parseInt(recipe.mockId))) {
            mockRecipeId = parseInt(recipe.mockId);
            console.log(`食谱有对应的mockId: ${mockRecipeId}`);
          }
        }
      }
      // 对于数字格式的ID（模拟数据）
      else if (!isNaN(parseInt(recipeId))) {
        // 检查是否有匹配此数字ID的食谱
        const numericId = parseInt(recipeId);
        console.log(`数字ID格式: ${numericId}`);

        // 设置mockRecipeId
        mockRecipeId = numericId;

        // 尝试通过mockId查找食谱
        const recipe = await Recipe.findOne({ mockId: numericId });
        if (recipe) {
          recipeExists = true;
          console.log(`通过mockId找到食谱: ${recipe.name}`);
          // 如果找到了食谱，使用它的MongoDB ID
          recipeIdForSaving = recipe._id.toString();
        } else {
          // 如果没找到食谱但是一个有效的数字ID，认为它存在（模拟数据）
          recipeExists = true;
          console.log(`未找到食谱，但使用模拟数据ID: ${numericId}`);
        }
      }
      // 其他格式的ID
      else {
        console.log(`非标准格式的ID: ${recipeId}`);
      }

      // 如果食谱不存在，记录警告但仍然允许添加收藏
      if (!recipeExists) {
        console.warn(`尝试收藏可能不存在的食谱: ${recipeId}`);
      }

      // 构建收藏数据对象
      const favoriteData = {
        userId,
        recipeId: recipeIdForSaving, // 使用处理后的recipeId
        notes,
      };

      // 只有当mockRecipeId是有效的数字时才添加到数据中
      if (mockRecipeId !== null && !isNaN(mockRecipeId)) {
        favoriteData.mockRecipeId = mockRecipeId;
        console.log(`设置mockRecipeId为: ${mockRecipeId}`);
      }

      // 保存收藏前记录日志
      console.log(`Creating favorite with data:`, favoriteData);

      // 创建并保存收藏记录
      const favorite = new FavoriteRecipe(favoriteData);
      const result = await favorite.save();

      // 更新被收藏后，应该使该用户的推荐食谱缓存失效
      // 因为推荐食谱中的收藏状态已经改变
      this.invalidateRecommendedCache(userId);

      return result;
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
      const result = await FavoriteRecipe.findOneAndDelete({
        userId,
        recipeId,
      });

      // 取消收藏后，使该用户的推荐食谱缓存失效
      this.invalidateRecommendedCache(userId);

      return result;
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

      // 使用Promise.all并行获取所有收藏食谱的详细信息
      const result = await Promise.all(
        favorites.map(async (fav) => {
          // 从收藏记录中获取recipeId
          const recipeId = fav.recipeId;

          // 基本的收藏信息
          const favoriteInfo = {
            favoriteId: fav._id.toString(),
            notes: fav.notes,
            createdAt: fav.createdAt,
          };

          try {
            // 尝试从数据库获取食谱详情
            let recipe = null;

            // 如果是有效的MongoDB ObjectId，直接查询
            if (mongoose.Types.ObjectId.isValid(recipeId)) {
              recipe = await Recipe.findById(recipeId);
            }

            // 如果找到了食谱，返回完整详情
            if (recipe) {
              return {
                id: recipe._id.toString(),
                name: recipe.name,
                cookingTime: recipe.cookingTime || 30,
                imageUrl: recipe.imageUrl || '/assets/food-placeholder.svg',
                spiceLevel: recipe.spiceLevel || 0,
                tags: recipe.tags || [],
                cuisine: recipe.cuisine,
                ...favoriteInfo,
              };
            } else {
              // 如果没找到食谱，记录警告并从收藏中删除
              console.warn(
                `收藏的食谱 ${recipeId} 在数据库中不存在，将从收藏中移除`,
              );

              // 异步删除无效收藏，但不等待完成
              FavoriteRecipe.findByIdAndDelete(fav._id).catch((err) => {
                console.error(`删除无效收藏 ${fav._id} 失败:`, err);
              });

              // 返回null，后面会过滤掉
              return null;
            }
          } catch (err) {
            console.error(`获取食谱 ${recipeId} 详情失败:`, err);
            // 出错时返回null，后面会过滤掉
            return null;
          }
        }),
      );

      // 过滤掉无效的食谱（null值）
      return result.filter((item) => item !== null);
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
        query._id = mongoose.Types.ObjectId(recipeId);
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

      let updatedRecipe = null;

      // If the recipe doesn't exist and it's a numeric ID, create a new recipe
      if (!existingRecipe && !isNaN(parseInt(recipeId))) {
        console.log(`Creating new recipe with mockId ${recipeId}`);
        // Create minimal recipe with the mockId and ingredients
        const newRecipe = new Recipe({
          name: `Recipe ${recipeId}`,
          description: '',
          cookingTime: 30,
          servings: 2,
          ingredients: ingredients,
          steps: ['将食材混合在一起'], // Add a default non-empty step to pass validation
          mockId: parseInt(recipeId),
          createdBy: '000000000000000000000001', // Default user ID
        });

        updatedRecipe = await newRecipe.save();
        console.log(`新建食谱成功: ${updatedRecipe._id}`);

        // 新创建的食谱，使所有用户的推荐食谱缓存失效
        // 这里简单粗暴地清除所有缓存，因为是新食谱
        this.invalidateAllRecommendedCache();
      }
      // If recipe exists, update it
      else if (existingRecipe) {
        updatedRecipe = await Recipe.findOneAndUpdate(
          query,
          { $set: { ingredients: ingredients } },
          { new: true, runValidators: true }, // 返回更新后的文档并运行验证
        );

        if (!updatedRecipe) {
          console.log(`未找到食谱 ${recipeId}`);
          return null;
        }

        console.log(`更新食谱成功: ${updatedRecipe._id}`);

        // 使该食谱创建者的推荐食谱缓存失效
        if (updatedRecipe.createdBy) {
          this.invalidateRecommendedCache(updatedRecipe.createdBy);
        }
      }

      // Only check inventory if we have a valid recipe update
      if (updatedRecipe) {
        try {
          // Check inventory and add missing ingredients to shopping list
          await this.checkInventoryAndAddToShoppingList(
            ingredients,
            updatedRecipe.createdBy,
          );
        } catch (inventoryError) {
          // Log error but don't fail the entire operation
          console.error('Error checking inventory:', inventoryError);
        }
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
      } else if (error.name === 'ValidationError') {
        console.error('ValidationError Details:', {
          errors: Object.keys(error.errors).map((field) => ({
            field,
            message: error.errors[field].message,
          })),
        });
      }
      throw error;
    }
  }

  // 使所有推荐食谱缓存失效的辅助方法
  invalidateAllRecommendedCache() {
    // 删除所有推荐食谱缓存
    for (const key in cache.cache) {
      if (key.startsWith('recommended_recipes_')) {
        console.log(`[缓存更新] 清除所有用户的推荐食谱缓存: ${key}`);
        cache.delete(key);
      }
    }
  }

  // 检查库存并添加缺少的食材到购物清单
  async checkInventoryAndAddToShoppingList(ingredients, userId) {
    try {
      // 导入所需模型
      const InventoryRepository = require('../../inventory/repositories/inventory.repository');

      if (
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        console.log('没有食材需要检查库存');
        return;
      }

      // 获取用户的库存
      const userInventory = await InventoryRepository.getUserInventory(userId);
      console.log(`用户库存数量: ${userInventory.length}`);

      // 检查每个食材
      for (const recipeIngredient of ingredients) {
        if (!recipeIngredient.name || recipeIngredient.quantity === undefined) {
          console.log('跳过无效食材:', recipeIngredient);
          continue;
        }

        // 在库存中查找食材 (不区分大小写)
        const inventoryItem = userInventory.find(
          (item) =>
            item.name.toLowerCase() === recipeIngredient.name.toLowerCase(),
        );

        // 如果食材不在库存中或者数量不足
        if (
          !inventoryItem ||
          inventoryItem.quantity < recipeIngredient.quantity
        ) {
          // 计算需要添加到购物清单的数量
          const requiredQuantity = !inventoryItem
            ? recipeIngredient.quantity
            : recipeIngredient.quantity - inventoryItem.quantity;

          // 查找购物清单中是否已有该食材
          const shoppingList =
            await InventoryRepository.getUserShoppingList(userId);
          const existingShoppingItem = shoppingList.find(
            (item) =>
              item.name.toLowerCase() === recipeIngredient.name.toLowerCase(),
          );

          if (existingShoppingItem) {
            // 如果购物清单中已有该食材，更新数量
            await InventoryRepository.updateShoppingItem(
              existingShoppingItem._id,
              { quantity: existingShoppingItem.quantity + requiredQuantity },
            );
            console.log(
              `更新购物清单食材: ${recipeIngredient.name}, 新数量: ${existingShoppingItem.quantity + requiredQuantity}`,
            );
          } else {
            // 如果购物清单中没有该食材，添加新的购物项
            const shoppingItemData = {
              name: recipeIngredient.name,
              quantity: requiredQuantity,
              unit: recipeIngredient.unit || 'g', // 使用食谱中的单位，如果没有则默认为"g"
              category: recipeIngredient.category || 'others', // 使用食谱中的分类，如果没有则默认为"others"
              userId: userId,
            };

            await InventoryRepository.addToShoppingList(shoppingItemData);
            console.log(
              `添加食材到购物清单: ${recipeIngredient.name}, 数量: ${requiredQuantity}`,
            );
          }
        } else {
          console.log(`库存中已有足够的 ${recipeIngredient.name}`);
        }
      }

      console.log('库存检查完成，已将缺少的食材添加到购物清单');
    } catch (error) {
      console.error('检查库存并添加到购物清单时出错:', error);
      // 这里我们不抛出错误，因为这是一个辅助功能，不应该影响主要功能
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

  // 使推荐食谱缓存失效的辅助方法
  invalidateRecommendedCache(userId) {
    // 删除所有与该用户相关的推荐食谱缓存（不同limit值可能有多个缓存）
    const cacheKeyPrefix = `recommended_recipes_${userId}_`;
    for (const key in cache.cache) {
      if (key.startsWith(cacheKeyPrefix)) {
        console.log(`[缓存更新] 清除用户 ${userId} 的推荐食谱缓存: ${key}`);
        cache.delete(key);
      }
    }
  }
}

module.exports = new RecipeRepository();
