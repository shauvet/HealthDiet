const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class FavoriteRecipe {
  static name = 'FavoriteRecipe';
}

Prop({
  type: mongoose.Schema.Types.Mixed,
  ref: 'Recipe',
  required: true,
})(FavoriteRecipe.prototype, 'recipeId');

Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  FavoriteRecipe.prototype,
  'userId',
);

Prop({ type: String, default: '' })(FavoriteRecipe.prototype, 'notes');

// 添加mockRecipeId字段，用于跟踪模拟菜谱的ID
Prop({ type: Number })(FavoriteRecipe.prototype, 'mockRecipeId');

// Apply Schema decorator
Schema({ timestamps: true })(FavoriteRecipe);

const FavoriteRecipeSchema = SchemaFactory.createForClass(FavoriteRecipe);
// 创建复合索引以确保用户对同一菜谱只能收藏一次
FavoriteRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = {
  FavoriteRecipe,
  FavoriteRecipeSchema,
};
