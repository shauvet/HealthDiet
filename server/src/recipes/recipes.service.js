const { Injectable, NotFoundException } = require('@nestjs/common');
const { InjectModel } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class RecipesService {
  constructor(recipeModel) {
    this.recipeModel = recipeModel;
  }

  async create(createRecipeDto, userId) {
    const newRecipe = new this.recipeModel({
      ...createRecipeDto,
      createdBy: userId,
    });
    return newRecipe.save();
  }

  async findAll(filterDto) {
    const { search, categories, maxCookingTime, ingredientNames, page, limit } =
      filterDto;

    const query = this.recipeModel.find();

    if (search) {
      query.or([
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]);
    }

    if (categories && categories.length > 0) {
      query.where('categories').in(categories);
    }

    if (maxCookingTime) {
      query.where('cookingTime').lte(maxCookingTime);
    }

    if (ingredientNames && ingredientNames.length > 0) {
      query.where('ingredients.name').in(ingredientNames);
    }

    const total = await this.recipeModel.countDocuments(query.getQuery());
    const recipes = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id) {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async findByUser(userId, filterDto) {
    const { page, limit } = filterDto;
    const query = this.recipeModel.find({
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    const total = await this.recipeModel.countDocuments(query.getQuery());
    const recipes = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateRecipeDto, userId) {
    const recipe = await this.recipeModel
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          createdBy: new mongoose.Types.ObjectId(userId),
        },
        updateRecipeDto,
        { new: true },
      )
      .exec();

    if (!recipe) {
      throw new NotFoundException(
        `Recipe with ID ${id} not found or you don't have permission to update it`,
      );
    }

    return recipe;
  }

  async remove(id, userId) {
    const result = await this.recipeModel
      .deleteOne({
        _id: new mongoose.Types.ObjectId(id),
        createdBy: new mongoose.Types.ObjectId(userId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Recipe with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    return true;
  }
}

// Apply decorators
const service = Injectable()(RecipesService);
InjectModel('Recipe')(service.prototype, 'recipeModel', 0);

module.exports = { RecipesService: service };
