const mongoose = require('mongoose');
const { ShoppingItemSchema } = require('../schemas/shoppingItem.schema');

// 创建模型，避免重复注册
const ShoppingItem =
  mongoose.models.ShoppingItem ||
  mongoose.model('ShoppingItem', ShoppingItemSchema);

class ShoppingListRepository {
  // 查找用户的购物清单
  async getUserShoppingList(userId) {
    console.log(
      `ShoppingListRepository - Getting shopping list for userId: ${userId}, filtering for non-completed items`,
    );
    // 同时检查purchased和isCompleted字段，兼容新旧两种模式
    const items = await ShoppingItem.find({
      userId,
      $or: [
        { purchased: false },
        { isCompleted: false },
        {
          $and: [
            { purchased: { $exists: false } },
            { isCompleted: { $exists: false } },
          ],
        },
      ],
    });
    console.log(
      `ShoppingListRepository - Found ${items.length} items in shopping list`,
    );

    // 打印前几项，以便查看
    if (items.length > 0) {
      console.log(
        'Sample shopping items:',
        items.slice(0, 3).map((item) => ({
          id: item._id,
          name: item.name,
          quantity: item.quantity,
          requiredQuantity: item.requiredQuantity,
          toBuyQuantity: item.toBuyQuantity,
          purchased: item.purchased,
          isCompleted: item.isCompleted,
        })),
      );
    }

    return items;
  }

  // 根据名称查找购物清单项
  async findItemByName(userId, name) {
    console.log(
      `ShoppingListRepository - Finding item by name for userId: ${userId}, name: ${name}`,
    );
    // 同时检查purchased和isCompleted字段，兼容新旧两种模式
    const item = await ShoppingItem.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // 不区分大小写的匹配
      $or: [
        { purchased: false },
        { isCompleted: false },
        {
          $and: [
            { purchased: { $exists: false } },
            { isCompleted: { $exists: false } },
          ],
        },
      ],
    });
    console.log(`ShoppingListRepository - Item found: ${item ? 'Yes' : 'No'}`);
    if (item) {
      console.log(
        `ShoppingListRepository - Item details: id=${item._id}, name=${item.name}, quantity=${item.quantity}, requiredQuantity=${item.requiredQuantity}, isCompleted=${item.isCompleted}, purchased=${item.purchased}`,
      );
    }
    return item;
  }

  // 添加购物清单项
  async addItem(shoppingItemData) {
    console.log('==== ShoppingListRepository - Adding item START ====');
    console.log(
      'ShoppingItem schema paths:',
      Object.keys(ShoppingItem.schema.paths),
    );
    console.log('Data being saved:', JSON.stringify(shoppingItemData, null, 2));

    // 确保所有必需字段都存在
    if (!shoppingItemData.quantity) {
      console.warn('MISSING QUANTITY field in shopping item data!');
      shoppingItemData.quantity = shoppingItemData.requiredQuantity || 1;
    }

    try {
      const shoppingItem = new ShoppingItem(shoppingItemData);
      const savedItem = await shoppingItem.save();
      console.log('Successfully saved shopping item:', savedItem._id);
      console.log('==== ShoppingListRepository - Adding item END ====');
      return savedItem;
    } catch (error) {
      console.error('ERROR saving shopping item:', error.message);
      console.error('ERROR stack:', error.stack);
      console.log('==== ShoppingListRepository - Adding item ERROR ====');
      throw error;
    }
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
    console.log(
      `Marking items as completed: ${itemIds}, completed: ${completed}`,
    );
    // 同时更新purchased和isCompleted字段，兼容新旧两种模式
    return await ShoppingItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { isCompleted: completed, purchased: completed } },
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
