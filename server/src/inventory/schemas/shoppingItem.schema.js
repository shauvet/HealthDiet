const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class ShoppingItem {
  static name = 'ShoppingItem';
}

// 购物清单项名称
Prop({ required: true, type: String })(ShoppingItem.prototype, 'name');

// 所需数量
Prop({ required: true, type: Number, default: 1 })(
  ShoppingItem.prototype,
  'requiredQuantity',
);

// 计划购买数量
Prop({ required: true, type: Number, default: 1 })(
  ShoppingItem.prototype,
  'toBuyQuantity',
);

// 计量单位
Prop({ required: true, type: String, default: 'g' })(
  ShoppingItem.prototype,
  'unit',
);

// 分类
Prop({
  required: true,
  type: String,
  default: 'others',
  enum: [
    'vegetables',
    'meat',
    'condiments',
    'dairy',
    'grains',
    'fruits',
    'others',
  ],
})(ShoppingItem.prototype, 'category');

// 是否已购买
Prop({ type: Boolean, default: false })(ShoppingItem.prototype, 'isCompleted');

// 优先级
Prop({
  type: String,
  default: 'medium',
  enum: ['low', 'medium', 'high'],
})(ShoppingItem.prototype, 'priority');

// 备注
Prop({ type: String })(ShoppingItem.prototype, 'notes');

// 添加时间
Prop({ type: Date, default: Date.now })(ShoppingItem.prototype, 'addedAt');

// 用户ID
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  ShoppingItem.prototype,
  'userId',
);

const ShoppingItemSchema = SchemaFactory.createForClass(ShoppingItem);

module.exports = {
  ShoppingItem,
  ShoppingItemSchema,
};
