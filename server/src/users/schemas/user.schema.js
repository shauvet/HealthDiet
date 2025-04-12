const { Schema, SchemaFactory, Prop } = require('@nestjs/mongoose');
const mongoose = require('mongoose');

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

class FamilyMember {
  static name = 'FamilyMember';
}

Prop({ required: true, type: String })(FamilyMember.prototype, 'name');
Prop({ required: true, type: String })(FamilyMember.prototype, 'relationship');
Prop({ enum: ['male', 'female', 'other'], type: String })(
  FamilyMember.prototype,
  'gender',
);
Prop({ type: Date })(FamilyMember.prototype, 'birthdate');
Prop({ type: Number })(FamilyMember.prototype, 'height');
Prop({ type: Number })(FamilyMember.prototype, 'weight');
Prop({ type: [String] })(FamilyMember.prototype, 'allergies');
Prop({ type: [String] })(FamilyMember.prototype, 'dietaryRestrictions');
Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })(
  FamilyMember.prototype,
  'userId',
);

const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);
FamilyMemberSchema.set('timestamps', true);

// Apply Schema decorator
Schema({ timestamps: true })(User);
Schema({ timestamps: true })(FamilyMember);

module.exports = {
  User,
  UserSchema,
  FamilyMember,
  FamilyMemberSchema,
};
