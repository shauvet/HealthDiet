const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class Recipe {
  static name = 'Recipe';
}

Prop({ required: true, type: String })(Recipe.prototype, 'name');
Prop({ type: String, default: '' })(Recipe.prototype, 'description');
Prop({ type: String, default: '/assets/food-placeholder.svg' })(
  Recipe.prototype,
  'imageUrl',
);
Prop({ type: Number, unique: true, sparse: true })(Recipe.prototype, 'mockId');
Prop({ type: Number, default: 0 })(Recipe.prototype, 'preparationTime');
Prop({ type: Number, required: true })(Recipe.prototype, 'cookingTime');
Prop({ type: Number, required: true })(Recipe.prototype, 'servings');
Prop({ type: String, default: '' })(Recipe.prototype, 'cuisine');
Prop({ type: Number, default: 0 })(Recipe.prototype, 'spiceLevel');

Prop({
  type: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
      isMain: { type: Boolean, default: false },
    },
  ],
  required: true,
  validate: [(val) => val.length > 0, '至少需要一个食材'],
})(Recipe.prototype, 'ingredients');

Prop({
  type: [String],
  required: true,
  validate: [
    (val) => val.filter((step) => step.trim() !== '').length > 0,
    '至少需要一个步骤',
  ],
})(Recipe.prototype, 'steps');

Prop({ type: [String], default: [] })(Recipe.prototype, 'categories');
Prop({ type: [String], default: [] })(Recipe.prototype, 'tags');

Prop({
  type: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  default: {},
})(Recipe.prototype, 'nutritionPerServing');

Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  Recipe.prototype,
  'createdBy',
);

// Apply Schema decorator
Schema({ timestamps: true })(Recipe);

const RecipeSchema = SchemaFactory.createForClass(Recipe);

module.exports = {
  Recipe,
  RecipeSchema,
};
