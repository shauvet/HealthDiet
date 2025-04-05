const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class Recipe {
  static name = 'Recipe';
}

Prop({ required: true })(Recipe.prototype, 'name');
Prop()(Recipe.prototype, 'description');
Prop()(Recipe.prototype, 'imageUrl');
Prop()(Recipe.prototype, 'preparationTime');
Prop()(Recipe.prototype, 'cookingTime');
Prop()(Recipe.prototype, 'servings');

Prop({ 
  type: [{ name: String, amount: Number, unit: String }] 
})(Recipe.prototype, 'ingredients');

Prop({ type: [String] })(Recipe.prototype, 'steps');
Prop({ type: [String] })(Recipe.prototype, 'categories');

Prop({
  type: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
  },
})(Recipe.prototype, 'nutritionPerServing');

Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })(Recipe.prototype, 'createdBy');

// Apply Schema decorator
Schema({ timestamps: true })(Recipe);

const RecipeSchema = SchemaFactory.createForClass(Recipe);

module.exports = {
  Recipe,
  RecipeSchema
}; 
