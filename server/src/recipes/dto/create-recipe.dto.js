const {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsNumberString,
  MinLength,
} = require('class-validator');
const { Type, Transform } = require('class-transformer');

class IngredientDto {}

IsString()(IngredientDto.prototype, 'name');
IsNumberString()(IngredientDto.prototype, 'quantity');
Transform(({ value }) => parseFloat(value))(
  IngredientDto.prototype,
  'quantity',
);
IsString()(IngredientDto.prototype, 'unit');
IsOptional()(IngredientDto.prototype, 'isMain');
IsBoolean()(IngredientDto.prototype, 'isMain');

class NutritionDto {}

IsNumber()(NutritionDto.prototype, 'calories');
IsNumber()(NutritionDto.prototype, 'protein');
IsNumber()(NutritionDto.prototype, 'fat');
IsNumber()(NutritionDto.prototype, 'carbs');
IsOptional()(NutritionDto.prototype, 'fiber');
IsNumber()(NutritionDto.prototype, 'fiber');

class CreateRecipeDto {}

IsString()(CreateRecipeDto.prototype, 'name');
MinLength(1, { message: '菜品名称不能为空' })(
  CreateRecipeDto.prototype,
  'name',
);

IsOptional()(CreateRecipeDto.prototype, 'description');
IsString()(CreateRecipeDto.prototype, 'description');

IsOptional()(CreateRecipeDto.prototype, 'imageUrl');
IsString()(CreateRecipeDto.prototype, 'imageUrl');
Transform(({ value }) => value || null)(CreateRecipeDto.prototype, 'imageUrl');

IsOptional()(CreateRecipeDto.prototype, 'preparationTime');
IsNumber()(CreateRecipeDto.prototype, 'preparationTime');

IsNumber()(CreateRecipeDto.prototype, 'cookingTime');
IsNumber()(CreateRecipeDto.prototype, 'servings');

IsOptional()(CreateRecipeDto.prototype, 'cuisine');
IsString()(CreateRecipeDto.prototype, 'cuisine');

IsOptional()(CreateRecipeDto.prototype, 'spiceLevel');
IsNumber()(CreateRecipeDto.prototype, 'spiceLevel');

IsArray()(CreateRecipeDto.prototype, 'ingredients');
ValidateNested({ each: true })(CreateRecipeDto.prototype, 'ingredients');
Type(() => IngredientDto)(CreateRecipeDto.prototype, 'ingredients');
MinLength(1, { message: '至少需要一个食材' })(
  CreateRecipeDto.prototype,
  'ingredients',
);

IsArray()(CreateRecipeDto.prototype, 'steps');
IsString({ each: true })(CreateRecipeDto.prototype, 'steps');
MinLength(1, { message: '至少需要一个步骤' })(
  CreateRecipeDto.prototype,
  'steps',
);
Transform(({ value }) => value.filter((step) => step.trim() !== ''))(
  CreateRecipeDto.prototype,
  'steps',
);

IsOptional()(CreateRecipeDto.prototype, 'tags');
IsArray()(CreateRecipeDto.prototype, 'tags');
IsString({ each: true })(CreateRecipeDto.prototype, 'tags');
Transform(({ value }) => value || [])(CreateRecipeDto.prototype, 'tags');

IsOptional()(CreateRecipeDto.prototype, 'categories');
IsArray()(CreateRecipeDto.prototype, 'categories');
IsString({ each: true })(CreateRecipeDto.prototype, 'categories');
Transform(({ value }) => value || [])(CreateRecipeDto.prototype, 'categories');

IsOptional()(CreateRecipeDto.prototype, 'nutritionPerServing');
ValidateNested()(CreateRecipeDto.prototype, 'nutritionPerServing');
Type(() => NutritionDto)(CreateRecipeDto.prototype, 'nutritionPerServing');

module.exports = {
  CreateRecipeDto,
  IngredientDto,
  NutritionDto,
};
