const {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsUrl,
} = require('class-validator');
const { Type } = require('class-transformer');

class IngredientDto {}

IsString()(IngredientDto.prototype, 'name');
IsNumber()(IngredientDto.prototype, 'amount');
IsString()(IngredientDto.prototype, 'unit');

class NutritionDto {}

IsNumber()(NutritionDto.prototype, 'calories');
IsNumber()(NutritionDto.prototype, 'protein');
IsNumber()(NutritionDto.prototype, 'fat');
IsNumber()(NutritionDto.prototype, 'carbs');
IsOptional()(NutritionDto.prototype, 'fiber');
IsNumber()(NutritionDto.prototype, 'fiber');

class CreateRecipeDto {}

IsString()(CreateRecipeDto.prototype, 'name');

IsOptional()(CreateRecipeDto.prototype, 'description');
IsString()(CreateRecipeDto.prototype, 'description');

IsOptional()(CreateRecipeDto.prototype, 'imageUrl');
IsUrl()(CreateRecipeDto.prototype, 'imageUrl');

IsNumber()(CreateRecipeDto.prototype, 'preparationTime');
IsNumber()(CreateRecipeDto.prototype, 'cookingTime');
IsNumber()(CreateRecipeDto.prototype, 'servings');

IsArray()(CreateRecipeDto.prototype, 'ingredients');
ValidateNested({ each: true })(CreateRecipeDto.prototype, 'ingredients');
Type(() => IngredientDto)(CreateRecipeDto.prototype, 'ingredients');

IsArray()(CreateRecipeDto.prototype, 'steps');
IsString({ each: true })(CreateRecipeDto.prototype, 'steps');

IsArray()(CreateRecipeDto.prototype, 'categories');
IsString({ each: true })(CreateRecipeDto.prototype, 'categories');

IsOptional()(CreateRecipeDto.prototype, 'nutritionPerServing');
ValidateNested()(CreateRecipeDto.prototype, 'nutritionPerServing');
Type(() => NutritionDto)(CreateRecipeDto.prototype, 'nutritionPerServing');

module.exports = {
  CreateRecipeDto,
  IngredientDto,
  NutritionDto,
};
