const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

// Create directly with Mongoose Schema instead of using NestJS decorators
const FamilyMemberSchema = new mongoose.Schema(
  {
    // 基本信息
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    birthdate: { type: Date },

    // 生理数据
    height: { type: Number, default: null },
    weight: { type: Number, default: null },

    // 饮食限制和过敏
    allergies: { type: String, default: '' },
    dietaryRestrictions: { type: String, default: '' },

    // 用户ID
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

// Use NestJS style schema for User if needed
class User {
  static name = 'User';
}

Prop({ required: true, type: String })(User.prototype, 'name');
Prop({ required: true, unique: true, type: String })(User.prototype, 'email');
Prop({ required: true, type: String })(User.prototype, 'password');
Prop({ type: String })(User.prototype, 'phone');
Prop({ enum: ['male', 'female', 'other'], type: String })(
  User.prototype,
  'gender',
);
Prop({ type: Number })(User.prototype, 'height');
Prop({ type: Number })(User.prototype, 'weight');
Prop({ type: Date })(User.prototype, 'birthdate');
Prop({ type: [String] })(User.prototype, 'allergies');
Prop({ type: [String] })(User.prototype, 'dietaryRestrictions');
Prop({ type: [String] })(User.prototype, 'healthGoals');

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('timestamps', true);

// Create FamilyMember class for backward compatibility
class FamilyMember {
  static name = 'FamilyMember';
}

// Apply Schema decorator
Schema({ timestamps: true })(User);
Schema({ timestamps: true })(FamilyMember);

module.exports = {
  User,
  UserSchema,
  FamilyMember,
  FamilyMemberSchema,
};
