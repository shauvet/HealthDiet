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
}

module.exports = new RecipeRepository();
