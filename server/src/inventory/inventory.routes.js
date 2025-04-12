const express = require('express');
const router = express.Router();
const InventoryController = require('./inventory.controller');

// 库存相关路由
router.get('/', InventoryController.getUserInventory);
router.post('/', InventoryController.addIngredient);
router.put('/:id', InventoryController.updateIngredient);
router.delete('/:id', InventoryController.removeIngredient);
router.get('/category', InventoryController.getInventoryByCategory);
router.get('/expiring', InventoryController.getExpiringIngredients);

// 购物清单相关路由
router.get('/shopping-list', InventoryController.getShoppingList);
router.post('/shopping-list', InventoryController.addToShoppingList);
router.put('/shopping-list/:id', InventoryController.updateShoppingItem);
router.delete('/shopping-list/:id', InventoryController.removeShoppingItem);
router.patch(
  '/shopping-list/:id/purchase',
  InventoryController.markAsPurchased,
);
router.post(
  '/shopping-list/purchase-multiple',
  InventoryController.markMultipleAsPurchased,
);
router.post(
  '/shopping-list/:id/move-to-inventory',
  InventoryController.moveToInventory,
);
router.post(
  '/shopping-list/move-multiple-to-inventory',
  InventoryController.bulkMoveToInventory,
);

module.exports = router;
