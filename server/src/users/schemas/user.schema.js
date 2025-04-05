const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

class User {
  static name = 'User';
}

Prop({ required: true })(User.prototype, 'name');
Prop({ required: true, unique: true })(User.prototype, 'email');
Prop({ required: true })(User.prototype, 'password');
Prop()(User.prototype, 'phone');
Prop({ enum: ['male', 'female', 'other'] })(User.prototype, 'gender');
Prop()(User.prototype, 'height');
Prop()(User.prototype, 'weight');
Prop()(User.prototype, 'birthdate');
Prop()(User.prototype, 'allergies');
Prop()(User.prototype, 'dietaryRestrictions');
Prop()(User.prototype, 'healthGoals');

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('timestamps', true);

class FamilyMember {
  static name = 'FamilyMember';
}

Prop({ required: true })(FamilyMember.prototype, 'name');
Prop({ required: true })(FamilyMember.prototype, 'relationship');
Prop({ enum: ['male', 'female', 'other'] })(FamilyMember.prototype, 'gender');
Prop()(FamilyMember.prototype, 'birthdate');
Prop()(FamilyMember.prototype, 'height');
Prop()(FamilyMember.prototype, 'weight');
Prop()(FamilyMember.prototype, 'allergies');
Prop()(FamilyMember.prototype, 'dietaryRestrictions');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(FamilyMember.prototype, 'userId');

const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);
FamilyMemberSchema.set('timestamps', true);

// Apply Schema decorator
Schema({ timestamps: true })(User);
Schema({ timestamps: true })(FamilyMember);

module.exports = {
  User,
  UserSchema,
  FamilyMember,
  FamilyMemberSchema
}; 
