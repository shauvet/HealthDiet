const { Module } = require('@nestjs/common');
const { MongooseModule } = require('@nestjs/mongoose');
const { RecipesService } = require('./recipes.service');
const { RecipesController } = require('./recipes.controller');
const { Recipe, RecipeSchema } = require('./schemas/recipe.schema');

const recipesModule = {
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
};

module.exports = {
  RecipesModule: Module(recipesModule)(class RecipesModule {}),
};
