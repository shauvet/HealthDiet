const InventoryRepository = require('./repositories/inventory.repository');
const ShoppingListRepository = require('./repositories/shoppingList.repository');

const InventoryService = {
  // 获取用户的库存食材
  async getUserInventory(userId) {
    return await InventoryRepository.getUserInventory(userId);
  },

  // 添加食材到库存
  async addIngredient(ingredientData) {
    return await InventoryRepository.addIngredient(ingredientData);
  },

  // 更新食材信息
  async updateIngredient(id, updateData) {
    return await InventoryRepository.updateIngredient(id, updateData);
  },

  // 删除食材
  async removeIngredient(id) {
    return await InventoryRepository.removeIngredient(id);
  },

  // 获取用户的购物清单
  async getUserShoppingList(userId) {
    return await ShoppingListRepository.getUserShoppingList(userId);
  },

  // 添加食材到购物清单
  async addToShoppingList(data) {
    try {
      // 检查是否已有相同名称的食材在购物清单中
      console.log('Adding to shopping list:', data);
      const existingItem = await ShoppingListRepository.findItemByName(
        data.userId,
        data.name,
      );

      if (existingItem) {
        // 如果存在，更新数量
        console.log('Found existing item in shopping list, updating quantity');
        const updatedItem = await ShoppingListRepository.updateItem(
          existingItem.id,
          {
            requiredQuantity:
              existingItem.requiredQuantity + (data.quantity || 1),
            // 确保保留其他属性
            toBuyQuantity: existingItem.toBuyQuantity + (data.quantity || 1),
          },
        );
        return updatedItem;
      } else {
        // 不存在，创建新的购物清单项
        console.log('Creating new item in shopping list');
        const shoppingListItem = {
          userId: data.userId,
          name: data.name,
          requiredQuantity: data.quantity || 1,
          toBuyQuantity: data.quantity || 1,
          unit: data.unit || 'piece',
          category: data.category || 'others',
          isCompleted: false,
          priority: 'medium',
          notes: `从膳食计划"${data.mealPlanName || '未知'}"添加`,
          addedAt: new Date(),
        };

        return await ShoppingListRepository.addItem(shoppingListItem);
      }
    } catch (error) {
      console.error('Error in addToShoppingList service:', error);
      throw error;
    }
  },

  // 更新购物清单项
  async updateShoppingItem(id, updateData) {
    return await ShoppingListRepository.updateItem(id, updateData);
  },

  // 将购物清单项标记为已购买
  async markItemAsPurchased(id, purchased = true) {
    return await ShoppingListRepository.markAsCompleted(id, purchased);
  },

  // 批量标记购物清单项为已购买
  async markItemsAsPurchased(ids, purchased = true) {
    return await ShoppingListRepository.markAsCompleted(ids, purchased);
  },

  // 删除购物清单项
  async removeShoppingItem(id) {
    return await ShoppingListRepository.removeItem(id);
  },

  // 将购物清单项添加到库存
  async moveToInventory(itemId) {
    // 这个功能需要更新，以使用ShoppingListRepository和InventoryRepository
    // 暂时使用旧的实现
    return await InventoryRepository.moveToInventory(itemId);
  },

  // 批量将购物清单项添加到库存
  async bulkMoveToInventory(itemIds) {
    // 这个功能需要更新，以使用ShoppingListRepository和InventoryRepository
    // 暂时使用旧的实现
    return await InventoryRepository.bulkMoveToInventory(itemIds);
  },

  // 按类别获取库存食材
  async getInventoryByCategory(userId) {
    const inventory = await InventoryRepository.getUserInventory(userId);

    // 按类别分组
    const categorized = {};

    inventory.forEach((item) => {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push(item);
    });

    return categorized;
  },

  // 检查库存中是否有即将过期的食材
  async getExpiringIngredients(userId, daysThreshold = 3) {
    const inventory = await InventoryRepository.getUserInventory(userId);
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + daysThreshold);

    return inventory.filter(
      (item) =>
        item.expiryDate &&
        new Date(item.expiryDate) <= threshold &&
        new Date(item.expiryDate) >= now,
    );
  },

  // 根据即将过期的食材推荐食谱
  async getRecipesForExpiringIngredients(userId) {
    // 这个方法需要与食谱repository联动，后续实现
    // 暂时返回空数组
    return [];
  },
};

module.exports = InventoryService;
