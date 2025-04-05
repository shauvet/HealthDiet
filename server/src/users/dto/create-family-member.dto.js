const {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum
} = require('class-validator');

class CreateFamilyMemberDto {}

// Apply decorators
IsNotEmpty()(CreateFamilyMemberDto.prototype, 'name');
IsString()(CreateFamilyMemberDto.prototype, 'name');

IsNotEmpty()(CreateFamilyMemberDto.prototype, 'relationship');
IsString()(CreateFamilyMemberDto.prototype, 'relationship');

IsOptional()(CreateFamilyMemberDto.prototype, 'gender');
IsEnum(['male', 'female', 'other'])(CreateFamilyMemberDto.prototype, 'gender');

IsOptional()(CreateFamilyMemberDto.prototype, 'birthdate');
IsDateString()(CreateFamilyMemberDto.prototype, 'birthdate');

IsOptional()(CreateFamilyMemberDto.prototype, 'height');
IsNumber()(CreateFamilyMemberDto.prototype, 'height');

IsOptional()(CreateFamilyMemberDto.prototype, 'weight');
IsNumber()(CreateFamilyMemberDto.prototype, 'weight');

IsOptional()(CreateFamilyMemberDto.prototype, 'allergies');
IsString()(CreateFamilyMemberDto.prototype, 'allergies');

IsOptional()(CreateFamilyMemberDto.prototype, 'dietaryRestrictions');
IsString()(CreateFamilyMemberDto.prototype, 'dietaryRestrictions');

module.exports = { CreateFamilyMemberDto }; 
