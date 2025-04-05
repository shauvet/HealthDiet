const { Injectable, NotFoundException } = require('@nestjs/common');
const { InjectModel } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class UsersService {
  constructor(userModel, familyMemberModel) {
    this.userModel = userModel;
    this.familyMemberModel = familyMemberModel;
  }

  async create(createUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findByEmail(email) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id) {
    return this.userModel.findById(id).exec();
  }

  async update(id, updateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getFamilyMembers(userId) {
    return this.familyMemberModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .exec();
  }

  async addFamilyMember(userId, createFamilyMemberDto) {
    const newMember = new this.familyMemberModel({
      ...createFamilyMemberDto,
      userId: new mongoose.Types.ObjectId(userId),
    });
    return newMember.save();
  }

  async updateFamilyMember(userId, memberId, updateData) {
    const member = await this.familyMemberModel
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(memberId),
          userId: new mongoose.Types.ObjectId(userId),
        },
        updateData,
        { new: true },
      )
      .exec();

    if (!member) {
      throw new NotFoundException('Family member not found');
    }

    return member;
  }

  async removeFamilyMember(userId, memberId) {
    const result = await this.familyMemberModel
      .deleteOne({
        _id: new mongoose.Types.ObjectId(memberId),
        userId: new mongoose.Types.ObjectId(userId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Family member not found');
    }

    return true;
  }
}

// Apply decorators
const service = Injectable()(UsersService);
InjectModel('User')(service.prototype, 'userModel', 0);
InjectModel('FamilyMember')(service.prototype, 'familyMemberModel', 1);

module.exports = { UsersService: service }; 
