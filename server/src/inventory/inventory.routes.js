const express = require('express');
const router = express.Router();
const InventoryController = require('./inventory.controller');

// 库存相关路由
router.get('/', InventoryController.getUserInventory);
router.post('/', InventoryController.addIngredient);
router.patch('/:id', InventoryController.updateIngredient);
router.delete('/:id', InventoryController.removeIngredient);
router.get('/category', InventoryController.getInventoryByCategory);
router.get('/expiring', InventoryController.getExpiringIngredients);

// 购物清单相关路由
router.get('/shopping-list', InventoryController.getShoppingList);
router.post('/shopping-list', InventoryController.addToShoppingList);
router.delete('/shopping-list/:id', InventoryController.removeShoppingItem);
router.patch('/shopping-list/:id', InventoryController.updateShoppingItem);
router.post(
  '/shopping-list/purchase/:id',
  InventoryController.markItemAsPurchased,
);
router.post(
  '/shopping-list/purchase-multiple',
  InventoryController.markItemsAsPurchased,
);
router.post(
  '/shopping-list/:id/move-to-inventory',
  InventoryController.moveToInventory,
);
router.post(
  '/shopping-list/bulk-move-to-inventory',
  InventoryController.bulkMoveToInventory,
);

// 添加一个调试路由，用于直接检查购物清单的数据库情况
router.get('/debug/shopping-list-all', async (req, res) => {
  try {
    console.log(
      'DEBUG ROUTE: Fetching all shopping list items, including completed ones',
    );
    const mongoose = require('mongoose');
    const { ShoppingItemSchema } = require('./schemas/shoppingItem.schema');

    const ShoppingItem =
      mongoose.models.ShoppingItem ||
      mongoose.model('ShoppingItem', ShoppingItemSchema);

    // 获取所有购物清单项，无论是否完成
    const allItems = await ShoppingItem.find({});
    console.log(`Found ${allItems.length} total shopping list items`);

    // 分类统计
    const completedItems = allItems.filter((item) => item.isCompleted === true);
    const incompleteItems = allItems.filter(
      (item) => item.isCompleted === false,
    );

    console.log(`Completed items: ${completedItems.length}`);
    console.log(`Incomplete items: ${incompleteItems.length}`);

    // 返回详细信息
    res.json({
      total: allItems.length,
      completed: completedItems.length,
      incomplete: incompleteItems.length,
      allItems: allItems.map((item) => ({
        id: item._id,
        name: item.name,
        requiredQuantity: item.requiredQuantity,
        toBuyQuantity: item.toBuyQuantity,
        isCompleted: item.isCompleted,
        userId: item.userId,
        notes: item.notes,
      })),
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
