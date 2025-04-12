const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class DailyNutrition {
  static name = 'DailyNutrition';
}

Prop({ required: true, type: Date })(DailyNutrition.prototype, 'date');
Prop({ type: Number, default: 0 })(DailyNutrition.prototype, 'calories');
Prop({ type: Number, default: 0 })(DailyNutrition.prototype, 'protein');
Prop({ type: Number, default: 0 })(DailyNutrition.prototype, 'fat');
Prop({ type: Number, default: 0 })(DailyNutrition.prototype, 'carbs');
Prop({ type: Number, default: 0 })(DailyNutrition.prototype, 'fiber');
Prop({
  type: [
    {
      name: { type: String },
      amount: { type: Number },
      unit: { type: String },
    },
  ],
  default: [],
})(DailyNutrition.prototype, 'vitamins');
Prop({
  type: [
    {
      name: { type: String },
      amount: { type: Number },
      unit: { type: String },
    },
  ],
  default: [],
})(DailyNutrition.prototype, 'minerals');
Prop({
  type: {
    grains: { type: Number, default: 0 },
    vegetables: { type: Number, default: 0 },
    fruits: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    dairy: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  default: {},
})(DailyNutrition.prototype, 'dietStructure');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  DailyNutrition.prototype,
  'userId',
);
Prop({
  type: [
    {
      recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      },
      servings: { type: Number, default: 1 },
    },
  ],
  default: [],
})(DailyNutrition.prototype, 'meals');

// Apply Schema decorator
Schema({ timestamps: true })(DailyNutrition);

const DailyNutritionSchema = SchemaFactory.createForClass(DailyNutrition);
// 创建复合索引以支持日期范围查询和用户ID查询
DailyNutritionSchema.index({ userId: 1, date: 1 });

class NutritionGoal {
  static name = 'NutritionGoal';
}

Prop({ type: Number })(NutritionGoal.prototype, 'caloriesGoal');
Prop({ type: Number })(NutritionGoal.prototype, 'proteinGoal');
Prop({ type: Number })(NutritionGoal.prototype, 'fatGoal');
Prop({ type: Number })(NutritionGoal.prototype, 'carbsGoal');
Prop({ type: Number })(NutritionGoal.prototype, 'fiberGoal');
Prop({
  type: [
    {
      name: { type: String },
      amount: { type: Number },
      unit: { type: String },
    },
  ],
  default: [],
})(NutritionGoal.prototype, 'vitaminGoals');
Prop({
  type: [
    {
      name: { type: String },
      amount: { type: Number },
      unit: { type: String },
    },
  ],
  default: [],
})(NutritionGoal.prototype, 'mineralGoals');
Prop({
  type: {
    grains: { type: Number, default: 0 },
    vegetables: { type: Number, default: 0 },
    fruits: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    dairy: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  default: {},
})(NutritionGoal.prototype, 'dietStructureGoal');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  NutritionGoal.prototype,
  'userId',
);

// Apply Schema decorator
Schema({ timestamps: true })(NutritionGoal);

const NutritionGoalSchema = SchemaFactory.createForClass(NutritionGoal);
NutritionGoalSchema.index({ userId: 1 });

module.exports = {
  DailyNutrition,
  DailyNutritionSchema,
  NutritionGoal,
  NutritionGoalSchema,
};
