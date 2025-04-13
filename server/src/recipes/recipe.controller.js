const RecipeService = require('./recipe.service');

const RecipeController = {
  // 获取食谱列表，支持分页和筛选
  async getRecipes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        name,
        cuisine,
        cookingTime,
        spiceLevel,
        categories,
        createdBy,
      } = req.query;

      // 构建筛选条件
      const filters = {};
      if (name) filters.name = name;
      if (cuisine) filters.cuisine = cuisine;
      if (cookingTime) filters.cookingTime = parseInt(cookingTime);
      if (spiceLevel !== undefined) filters.spiceLevel = parseInt(spiceLevel);
      if (categories) filters.categories = categories.split(',');
      if (createdBy) filters.createdBy = createdBy;

      const recipes = await RecipeService.getRecipes(
        filters,
        parseInt(page),
        parseInt(limit),
      );
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({ error: 'Failed to get recipes' });
    }
  },

  // 根据ID获取食谱详情
  async getRecipeById(req, res) {
    try {
      const { id } = req.params;

      const recipe = await RecipeService.getRecipeById(id);

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json(recipe);
    } catch (error) {
      console.error('Error getting recipe:', error);
      res.status(500).json({ error: 'Failed to get recipe' });
    }
  },

  // 创建新食谱
  async createRecipe(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const recipeData = { ...req.body, createdBy: userId };

      const recipe = await RecipeService.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: 'Failed to create recipe' });
    }
  },

  // 更新食谱
  async updateRecipe(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedRecipe = await RecipeService.updateRecipe(id, updateData);

      if (!updatedRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json(updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  },

  // 删除食谱
  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;

      const result = await RecipeService.deleteRecipe(id);

      if (!result) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json({ success: true, message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ error: 'Failed to delete recipe' });
    }
  },

  // 搜索食谱
  async searchRecipes(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const recipes = await RecipeService.searchRecipes(q);
      res.json(recipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
      res.status(500).json({ error: 'Failed to search recipes' });
    }
  },

  // 获取推荐食谱
  async getRecommendedRecipes(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const limit = req.query.limit ? parseInt(req.query.limit) : 6;

      const recipes = await RecipeService.getRecommendedRecipes(userId, limit);
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recommended recipes:', error);
      res.status(500).json({ error: 'Failed to get recommended recipes' });
    }
  },

  // 获取用户的个人食谱
  async getUserRecipes(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const recipes = await RecipeService.getUserRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error('Error getting user recipes:', error);
      res.status(500).json({ error: 'Failed to get user recipes' });
    }
  },

  // 收藏食谱
  async favoriteRecipe(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body?.userId || '000000000000000000000001';
      const { recipeId } = req.params;
      const notes = req.body?.notes || '';

      // 检查recipeId是否有效
      if (!recipeId || recipeId === 'undefined' || recipeId === 'null') {
        console.error('Invalid recipeId:', recipeId);
        return res.status(400).json({
          error: 'Invalid recipe ID',
          details: {
            providedId: recipeId,
            message: 'Recipe ID cannot be undefined, null, or empty',
          },
        });
      }

      console.log('Favoriting recipe with params:', {
        userId,
        recipeId,
        notes,
      });

      // 调用服务层方法保存收藏记录到数据库
      const result = await RecipeService.favoriteRecipe(
        userId,
        recipeId,
        notes,
      );

      return res.status(201).json({
        success: true,
        message: 'Recipe favorited successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error favoriting recipe:', error);
      console.error('Error stack:', error.stack);

      // 提供更详细的错误响应
      if (error.code === 11000) {
        // 重复键错误 - 可能是用户已经收藏过这个食谱
        return res.status(409).json({
          error: 'Recipe already favorited',
          details: error.keyValue,
        });
      }

      res.status(500).json({
        error: 'Failed to favorite recipe',
        message: error.message,
      });
    }
  },

  // 取消收藏
  async unfavoriteRecipe(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const { recipeId } = req.params;

      // 检查recipeId是否有效
      if (!recipeId || recipeId === 'undefined' || recipeId === 'null') {
        console.error('Invalid recipeId:', recipeId);
        return res.status(400).json({
          error: 'Invalid recipe ID',
          details: {
            providedId: recipeId,
            message: 'Recipe ID cannot be undefined, null, or empty',
          },
        });
      }

      console.log('Unfavoriting recipe with params:', {
        userId,
        recipeId,
      });

      const result = await RecipeService.unfavoriteRecipe(userId, recipeId);

      if (!result) {
        return res.status(404).json({
          error: 'Favorite not found',
          details: {
            userId,
            recipeId,
          },
        });
      }

      res.json({
        success: true,
        message: 'Recipe unfavorited successfully',
        recipeId,
      });
    } catch (error) {
      console.error('Error unfavoriting recipe:', error);
      res.status(500).json({
        error: 'Failed to unfavorite recipe',
        message: error.message,
      });
    }
  },

  // 获取用户收藏的食谱
  async getUserFavorites(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const favorites = await RecipeService.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error getting user favorites:', error);
      res.status(500).json({ error: 'Failed to get user favorites' });
    }
  },

  // 检查用户是否已收藏食谱
  async isRecipeFavorited(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const { recipeId } = req.params;

      const isFavorited = await RecipeService.isRecipeFavorited(
        userId,
        recipeId,
      );
      res.json({ isFavorited });
    } catch (error) {
      console.error('Error checking if recipe is favorited:', error);
      res.status(500).json({ error: 'Failed to check if recipe is favorited' });
    }
  },

  // 获取基于特定食材的食谱
  async getRecipesByIngredients(req, res) {
    try {
      const { ingredients } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      if (!ingredients) {
        return res.status(400).json({ error: 'Ingredients are required' });
      }

      const ingredientNames = ingredients.split(',').map((name) => name.trim());
      const recipes = await RecipeService.getRecipesByIngredients(
        ingredientNames,
        limit,
      );
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recipes by ingredients:', error);
      res.status(500).json({ error: 'Failed to get recipes by ingredients' });
    }
  },

  // 更新食谱食材
  async updateRecipeIngredients(req, res) {
    try {
      const { id } = req.params;
      const { ingredients } = req.body;

      console.log(`[CONTROLLER] 尝试更新食谱 ${id} 的食材`);

      if (!ingredients || !Array.isArray(ingredients)) {
        return res
          .status(400)
          .json({ error: 'Valid ingredients array is required' });
      }

      // 验证每个食材对象是否包含必要的字段
      for (const ingredient of ingredients) {
        if (
          !ingredient.name ||
          ingredient.quantity === undefined ||
          !ingredient.unit
        ) {
          return res.status(400).json({
            error: 'Each ingredient must have name, quantity, and unit fields',
          });
        }
      }

      const updatedRecipe = await RecipeService.updateRecipeIngredients(
        id,
        ingredients,
      );

      if (!updatedRecipe) {
        // If no recipe found with the given ID, we'll create a new one in the repository
        console.log(`[CONTROLLER] 没有找到ID为 ${id} 的食谱`);
      }

      console.log(`[CONTROLLER] 成功处理食谱 ${id} 的食材更新`);
      res.json(
        updatedRecipe || { error: 'Recipe not found but ingredients recorded' },
      );
    } catch (error) {
      console.error('[CONTROLLER] Error updating recipe ingredients:', error);
      console.error('[CONTROLLER] Error stack:', error.stack);
      res.status(500).json({
        error: 'Failed to update recipe ingredients',
        message: error.message,
        details:
          error.name === 'CastError'
            ? {
                value: error.value,
                path: error.path,
                kind: error.kind,
              }
            : error.name === 'ValidationError'
              ? {
                  validationErrors: Object.keys(error.errors).map((field) => ({
                    field,
                    message: error.errors[field].message,
                  })),
                }
              : undefined,
      });
    }
  },

  // 获取类似食谱
  async getSimilarRecipes(req, res) {
    try {
      const { recipeId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 3;

      const recipes = await RecipeService.getSimilarRecipes(recipeId, limit);
      res.json(recipes);
    } catch (error) {
      console.error('Error getting similar recipes:', error);
      res.status(500).json({ error: 'Failed to get similar recipes' });
    }
  },

  // 根据膳食类型获取食谱（早餐、午餐、晚餐）
  async getRecipesByMealType(req, res) {
    try {
      const { mealType } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
        return res.status(400).json({ error: 'Invalid meal type' });
      }

      const recipes = await RecipeService.getRecipesByMealType(mealType, limit);
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recipes by meal type:', error);
      res.status(500).json({ error: 'Failed to get recipes by meal type' });
    }
  },
};

module.exports = RecipeController;
