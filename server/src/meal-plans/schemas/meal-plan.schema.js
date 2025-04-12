const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class MealPlan {
  static name = 'MealPlan';
}

Prop({ required: true, type: Date })(MealPlan.prototype, 'date');
Prop({
  required: true,
  type: String,
  enum: ['breakfast', 'lunch', 'dinner', 'snack'],
})(MealPlan.prototype, 'mealType');
Prop({
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Recipe',
  required: true,
})(MealPlan.prototype, 'recipeId');
Prop({ type: Number, default: 1 })(MealPlan.prototype, 'servings');
Prop({ type: Boolean, default: false })(MealPlan.prototype, 'completed');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  MealPlan.prototype,
  'userId',
);
Prop({
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'FamilyMember',
  default: [],
})(MealPlan.prototype, 'forFamilyMembers');
Prop({ type: String, default: '' })(MealPlan.prototype, 'notes');

// Apply Schema decorator
Schema({ timestamps: true })(MealPlan);

const MealPlanSchema = SchemaFactory.createForClass(MealPlan);
// 创建复合索引以支持日期范围查询和用户ID查询
MealPlanSchema.index({ userId: 1, date: 1 });

module.exports = {
  MealPlan,
  MealPlanSchema,
};
