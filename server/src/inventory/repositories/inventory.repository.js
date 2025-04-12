const mongoose = require('mongoose');
const {
  IngredientSchema,
  ShoppingItemSchema,
} = require('../schemas/inventory.schema');

// 创建模型
const Ingredient = mongoose.model('Ingredient', IngredientSchema);
const ShoppingItem = mongoose.model('ShoppingItem', ShoppingItemSchema);

class InventoryRepository {
  // 获取用户的所有库存食材
  async getUserInventory(userId) {
    return await Ingredient.find({ userId });
  }

  // 添加食材到库存
  async addIngredient(ingredientData) {
    const ingredient = new Ingredient(ingredientData);
    return await ingredient.save();
  }

  // 更新食材信息
  async updateIngredient(id, updateData) {
    return await Ingredient.findByIdAndUpdate(id, updateData, { new: true });
  }

  // 删除食材
  async removeIngredient(id) {
    return await Ingredient.findByIdAndDelete(id);
  }

  // 获取用户的购物清单
  async getUserShoppingList(userId) {
    return await ShoppingItem.find({ userId });
  }

  // 添加购物项目
  async addToShoppingList(shoppingItemData) {
    const shoppingItem = new ShoppingItem(shoppingItemData);
    return await shoppingItem.save();
  }

  // 更新购物项目
  async updateShoppingItem(id, updateData) {
    return await ShoppingItem.findByIdAndUpdate(id, updateData, { new: true });
  }

  // 标记购物项目为已购买
  async markItemAsPurchased(id, purchased = true) {
    return await ShoppingItem.findByIdAndUpdate(
      id,
      { purchased },
      { new: true },
    );
  }

  // 批量标记购物项目为已购买
  async markItemsAsPurchased(ids, purchased = true) {
    return await ShoppingItem.updateMany(
      { _id: { $in: ids } },
      { $set: { purchased } },
    );
  }

  // 删除购物项目
  async removeShoppingItem(id) {
    return await ShoppingItem.findByIdAndDelete(id);
  }

  // 将已购买的商品转移到库存中
  async moveToInventory(shoppingItemId) {
    const shoppingItem = await ShoppingItem.findById(shoppingItemId);

    if (!shoppingItem) {
      throw new Error('购物项目不存在');
    }

    // 检查库存中是否已存在该食材
    const existingIngredient = await Ingredient.findOne({
      name: shoppingItem.name,
      userId: shoppingItem.userId,
    });

    if (existingIngredient) {
      // 如果存在，增加数量
      existingIngredient.quantity += shoppingItem.quantity;
      await existingIngredient.save();

      // 删除购物项目
      await ShoppingItem.findByIdAndDelete(shoppingItemId);

      return existingIngredient;
    } else {
      // 如果不存在，创建新的库存食材
      const ingredient = new Ingredient({
        name: shoppingItem.name,
        quantity: shoppingItem.quantity,
        unit: shoppingItem.unit,
        category: shoppingItem.category,
        userId: shoppingItem.userId,
      });

      await ingredient.save();

      // 删除购物项目
      await ShoppingItem.findByIdAndDelete(shoppingItemId);

      return ingredient;
    }
  }

  // 批量将购物清单转移到库存
  async bulkMoveToInventory(shoppingItemIds) {
    const results = [];

    for (const id of shoppingItemIds) {
      try {
        const result = await this.moveToInventory(id);
        results.push(result);
      } catch (error) {
        console.error(`移动购物项目 ${id} 到库存时出错:`, error);
      }
    }

    return results;
  }
}

module.exports = new InventoryRepository();
