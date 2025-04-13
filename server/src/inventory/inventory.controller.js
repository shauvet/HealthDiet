const InventoryService = require('./inventory.service');

const InventoryController = {
  // 获取用户的食材库存
  async getUserInventory(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const inventory = await InventoryService.getUserInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error('Error getting inventory:', error);
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  },

  // 添加食材到库存
  async addIngredient(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const ingredientData = { ...req.body, userId };

      const newIngredient =
        await InventoryService.addIngredient(ingredientData);
      res.status(201).json(newIngredient);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      res.status(500).json({ error: 'Failed to add ingredient' });
    }
  },

  // 更新食材信息
  async updateIngredient(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedIngredient = await InventoryService.updateIngredient(
        id,
        updateData,
      );

      if (!updatedIngredient) {
        return res.status(404).json({ error: 'Ingredient not found' });
      }

      res.json(updatedIngredient);
    } catch (error) {
      console.error('Error updating ingredient:', error);
      res.status(500).json({ error: 'Failed to update ingredient' });
    }
  },

  // 删除食材
  async removeIngredient(req, res) {
    try {
      const { id } = req.params;

      const result = await InventoryService.removeIngredient(id);

      if (!result) {
        return res.status(404).json({ error: 'Ingredient not found' });
      }

      res.json({ success: true, message: 'Ingredient removed successfully' });
    } catch (error) {
      console.error('Error removing ingredient:', error);
      res.status(500).json({ error: 'Failed to remove ingredient' });
    }
  },

  // 获取用户的购物清单
  async getShoppingList(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const shoppingList = await InventoryService.getUserShoppingList(userId);
      res.json(shoppingList);
    } catch (error) {
      console.error('Error getting shopping list:', error);
      res.status(500).json({ error: 'Failed to get shopping list' });
    }
  },

  // 添加食材到购物清单
  async addToShoppingList(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.body.userId || '000000000000000000000001';
      const itemData = {
        ...req.body,
        userId,
        // 确保quantity字段存在，防止验证错误
        quantity: req.body.quantity || req.body.requiredQuantity || 1,
      };

      const newItem = await InventoryService.addToShoppingList(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      res.status(500).json({ error: 'Failed to add to shopping list' });
    }
  },

  // 更新购物清单项
  async updateShoppingItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedItem = await InventoryService.updateShoppingItem(
        id,
        updateData,
      );

      if (!updatedItem) {
        return res.status(404).json({ error: 'Shopping item not found' });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating shopping item:', error);
      res.status(500).json({ error: 'Failed to update shopping item' });
    }
  },

  // 标记购物清单项为已购买
  async markItemAsPurchased(req, res) {
    try {
      const { id } = req.params;
      const { purchased } = req.body;

      const updatedItem = await InventoryService.markItemAsPurchased(
        id,
        purchased,
      );

      if (!updatedItem) {
        return res.status(404).json({ error: 'Shopping item not found' });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      res.status(500).json({ error: 'Failed to mark item as purchased' });
    }
  },

  // 批量标记购物清单项为已购买
  async markItemsAsPurchased(req, res) {
    try {
      const { ids, purchased } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty ids array' });
      }

      const result = await InventoryService.markItemsAsPurchased(
        ids,
        purchased,
      );
      res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
      console.error('Error marking items as purchased:', error);
      res.status(500).json({ error: 'Failed to mark items as purchased' });
    }
  },

  // 删除购物清单项
  async removeShoppingItem(req, res) {
    try {
      const { id } = req.params;

      const result = await InventoryService.removeShoppingItem(id);

      if (!result) {
        return res.status(404).json({ error: 'Shopping item not found' });
      }

      res.json({
        success: true,
        message: 'Shopping item removed successfully',
      });
    } catch (error) {
      console.error('Error removing shopping item:', error);
      res.status(500).json({ error: 'Failed to remove shopping item' });
    }
  },

  // 将购物清单项添加到库存
  async moveToInventory(req, res) {
    try {
      const { id } = req.params;

      const result = await InventoryService.moveToInventory(id);
      res.json(result);
    } catch (error) {
      console.error('Error moving to inventory:', error);
      res.status(500).json({ error: 'Failed to move to inventory' });
    }
  },

  // 批量将购物清单项添加到库存
  async bulkMoveToInventory(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty ids array' });
      }

      const results = await InventoryService.bulkMoveToInventory(ids);
      res.json(results);
    } catch (error) {
      console.error('Error moving items to inventory:', error);
      res.status(500).json({ error: 'Failed to move items to inventory' });
    }
  },

  // 获取按类别分组的库存食材
  async getInventoryByCategory(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';

      const categorizedInventory =
        await InventoryService.getInventoryByCategory(userId);
      res.json(categorizedInventory);
    } catch (error) {
      console.error('Error getting categorized inventory:', error);
      res.status(500).json({ error: 'Failed to get categorized inventory' });
    }
  },

  // 获取即将过期的食材
  async getExpiringIngredients(req, res) {
    try {
      // 从请求中获取用户ID
      const userId =
        req.userId || req.query.userId || '000000000000000000000001';
      const days = req.query.days ? parseInt(req.query.days) : 3;

      const expiringItems = await InventoryService.getExpiringIngredients(
        userId,
        days,
      );
      res.json(expiringItems);
    } catch (error) {
      console.error('Error getting expiring ingredients:', error);
      res.status(500).json({ error: 'Failed to get expiring ingredients' });
    }
  },
};

module.exports = InventoryController;
