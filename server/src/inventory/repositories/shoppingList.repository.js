const mongoose = require('mongoose');
const { ShoppingItemSchema } = require('../schemas/shoppingItem.schema');

// 创建模型，避免重复注册
const ShoppingItem =
  mongoose.models.ShoppingItem ||
  mongoose.model('ShoppingItem', ShoppingItemSchema);

class ShoppingListRepository {
  // 查找用户的购物清单
  async getUserShoppingList(userId) {
    return await ShoppingItem.find({ userId, isCompleted: false });
  }

  // 根据名称查找购物清单项
  async findItemByName(userId, name) {
    return await ShoppingItem.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // 不区分大小写的匹配
    });
  }

  // 添加购物清单项
  async addItem(shoppingItemData) {
    console.log('ShoppingListRepository - Adding item:', shoppingItemData);
    const shoppingItem = new ShoppingItem(shoppingItemData);
    return await shoppingItem.save();
  }

  // 更新购物清单项
  async updateItem(id, updateData) {
    console.log('ShoppingListRepository - Updating item:', id, updateData);
    return await ShoppingItem.findByIdAndUpdate(id, updateData, { new: true });
  }

  // 删除购物清单项
  async removeItem(id) {
    return await ShoppingItem.findByIdAndDelete(id);
  }

  // 批量标记为已完成
  async markAsCompleted(itemIds, completed = true) {
    return await ShoppingItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { isCompleted: completed } },
    );
  }

  // 将已购商品转移到库存
  async moveToInventory(itemIds, InventoryRepository) {
    // 这里需要实现将已购商品转移到库存的逻辑
    // 可能需要获取购物清单项，创建库存项，然后删除购物清单项
    // 实现细节依赖于InventoryRepository的实现
  }
}

module.exports = new ShoppingListRepository();
