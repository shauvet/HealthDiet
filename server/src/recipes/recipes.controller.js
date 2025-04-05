const {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');
const { RecipesService } = require('./recipes.service');
const { CreateRecipeDto } = require('./dto/create-recipe.dto');
const { RecipeFilterDto } = require('./dto/recipe-filter.dto');

class RecipesController {
  constructor(recipesService) {
    this.recipesService = recipesService;
  }

  async create(req, createRecipeDto) {
    return this.recipesService.create(createRecipeDto, req.user.userId);
  }

  async findAll(filterDto) {
    return this.recipesService.findAll(filterDto);
  }

  async findOne(id) {
    return this.recipesService.findOne(id);
  }

  async findMyRecipes(req, filterDto) {
    return this.recipesService.findByUser(req.user.userId, filterDto);
  }

  async update(req, id, updateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto, req.user.userId);
  }

  async remove(req, id) {
    await this.recipesService.remove(id, req.user.userId);
    return { success: true };
  }
}

// Apply controller decorator
const controller = Controller('recipes')(RecipesController);

// Public endpoints
Get()(controller.prototype, 'findAll');
Query()(controller.prototype, 'findAll', 0);

Get(':id')(controller.prototype, 'findOne');
Param('id')(controller.prototype, 'findOne', 0);

// Protected endpoints
UseGuards(JwtAuthGuard)(controller.prototype, 'create');
Post()(controller.prototype, 'create');
Request()(controller.prototype, 'create', 0);
Body()(controller.prototype, 'create', 1);

UseGuards(JwtAuthGuard)(controller.prototype, 'findMyRecipes');
Get('user/me')(controller.prototype, 'findMyRecipes');
Request()(controller.prototype, 'findMyRecipes', 0);
Query()(controller.prototype, 'findMyRecipes', 1);

UseGuards(JwtAuthGuard)(controller.prototype, 'update');
Patch(':id')(controller.prototype, 'update');
Request()(controller.prototype, 'update', 0);
Param('id')(controller.prototype, 'update', 1);
Body()(controller.prototype, 'update', 2);

UseGuards(JwtAuthGuard)(controller.prototype, 'remove');
Delete(':id')(controller.prototype, 'remove');
Request()(controller.prototype, 'remove', 0);
Param('id')(controller.prototype, 'remove', 1);

module.exports = { RecipesController: controller };
