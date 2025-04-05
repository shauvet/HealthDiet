const { IsOptional, IsString, IsArray, IsNumber } = require('class-validator');

class RecipeFilterDto {
  constructor() {
    this.page = 1;
    this.limit = 10;
  }
}

// Apply decorators
IsOptional()(RecipeFilterDto.prototype, 'search');
IsString()(RecipeFilterDto.prototype, 'search');

IsOptional()(RecipeFilterDto.prototype, 'categories');
IsArray()(RecipeFilterDto.prototype, 'categories');

IsOptional()(RecipeFilterDto.prototype, 'maxCookingTime');
IsNumber()(RecipeFilterDto.prototype, 'maxCookingTime');

IsOptional()(RecipeFilterDto.prototype, 'ingredientNames');
IsArray()(RecipeFilterDto.prototype, 'ingredientNames');

IsOptional()(RecipeFilterDto.prototype, 'page');
IsNumber()(RecipeFilterDto.prototype, 'page');

IsOptional()(RecipeFilterDto.prototype, 'limit');
IsNumber()(RecipeFilterDto.prototype, 'limit');

module.exports = { RecipeFilterDto };
