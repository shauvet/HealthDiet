const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class Ingredient {
  static name = 'Ingredient';
}

Prop({ required: true, type: String })(Ingredient.prototype, 'name');
Prop({ required: true, type: Number })(Ingredient.prototype, 'quantity');
Prop({ required: true, type: String })(Ingredient.prototype, 'unit');
Prop({
  type: String,
  enum: [
    'vegetables',
    'fruits',
    'meat',
    'dairy',
    'grains',
    'condiments',
    'others',
  ],
  default: 'others',
})(Ingredient.prototype, 'category');
Prop({ type: Date })(Ingredient.prototype, 'expiryDate');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  Ingredient.prototype,
  'userId',
);

// Apply Schema decorator
Schema({ timestamps: true })(Ingredient);

const IngredientSchema = SchemaFactory.createForClass(Ingredient);

class ShoppingItem {
  static name = 'ShoppingItem';
}

Prop({ required: true, type: String })(ShoppingItem.prototype, 'name');
Prop({ required: true, type: Number })(ShoppingItem.prototype, 'quantity');
Prop({ required: true, type: String })(ShoppingItem.prototype, 'unit');
Prop({
  type: String,
  enum: [
    'vegetables',
    'fruits',
    'meat',
    'dairy',
    'grains',
    'condiments',
    'others',
  ],
  default: 'others',
})(ShoppingItem.prototype, 'category');
Prop({ type: Boolean, default: false })(ShoppingItem.prototype, 'purchased');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  ShoppingItem.prototype,
  'userId',
);

// Apply Schema decorator
Schema({ timestamps: true })(ShoppingItem);

const ShoppingItemSchema = SchemaFactory.createForClass(ShoppingItem);

module.exports = {
  Ingredient,
  IngredientSchema,
  ShoppingItem,
  ShoppingItemSchema,
};
