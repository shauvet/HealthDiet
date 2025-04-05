const { Module } = require('@nestjs/common');
const { MongooseModule } = require('@nestjs/mongoose');
const { UsersController } = require('./users.controller');
const { UsersService } = require('./users.service');
const { User, UserSchema, FamilyMember, FamilyMemberSchema } = require('./schemas/user.schema');

const usersModule = {
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
};

module.exports = {
  UsersModule: Module(usersModule)(class UsersModule {})
}; 
