const {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async getProfile(req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async updateProfile(req, updateUserDto) {
    const updated = await this.usersService.update(
      req.user.userId,
      updateUserDto,
    );
    const { password, ...result } = updated.toObject();
    return result;
  }

  async getFamilyMembers(req) {
    return this.usersService.getFamilyMembers(req.user.userId);
  }

  async addFamilyMember(req, createFamilyMemberDto) {
    return this.usersService.addFamilyMember(
      req.user.userId,
      createFamilyMemberDto,
    );
  }

  async updateFamilyMember(req, id, updateData) {
    return this.usersService.updateFamilyMember(
      req.user.userId,
      id,
      updateData,
    );
  }

  async removeFamilyMember(req, id) {
    await this.usersService.removeFamilyMember(req.user.userId, id);
    return { success: true };
  }
}

// Apply decorators
const controller = Controller('users')(UsersController);
UseGuards(JwtAuthGuard)(controller);

// Endpoints
Get('profile')(controller.prototype, 'getProfile');
Request()(controller.prototype, 'getProfile', 0);

Patch('profile')(controller.prototype, 'updateProfile');
Request()(controller.prototype, 'updateProfile', 0);
Body()(controller.prototype, 'updateProfile', 1);

Get('family')(controller.prototype, 'getFamilyMembers');
Request()(controller.prototype, 'getFamilyMembers', 0);

Post('family')(controller.prototype, 'addFamilyMember');
Request()(controller.prototype, 'addFamilyMember', 0);
Body()(controller.prototype, 'addFamilyMember', 1);

Patch('family/:id')(controller.prototype, 'updateFamilyMember');
Request()(controller.prototype, 'updateFamilyMember', 0);
Param('id')(controller.prototype, 'updateFamilyMember', 1);
Body()(controller.prototype, 'updateFamilyMember', 2);

Delete('family/:id')(controller.prototype, 'removeFamilyMember');
Request()(controller.prototype, 'removeFamilyMember', 0);
Param('id')(controller.prototype, 'removeFamilyMember', 1);

module.exports = { UsersController: controller }; 
