const {
  IsEmail,
  IsOptional,
  MinLength,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum
} = require('class-validator');

class UpdateUserDto {}

// Apply decorators
IsOptional()(UpdateUserDto.prototype, 'name');
IsString()(UpdateUserDto.prototype, 'name');

IsOptional()(UpdateUserDto.prototype, 'email');
IsEmail()(UpdateUserDto.prototype, 'email');

IsOptional()(UpdateUserDto.prototype, 'password');
MinLength(6)(UpdateUserDto.prototype, 'password');

IsOptional()(UpdateUserDto.prototype, 'phone');
IsString()(UpdateUserDto.prototype, 'phone');

IsOptional()(UpdateUserDto.prototype, 'gender');
IsEnum(['male', 'female', 'other'])(UpdateUserDto.prototype, 'gender');

IsOptional()(UpdateUserDto.prototype, 'height');
IsNumber()(UpdateUserDto.prototype, 'height');

IsOptional()(UpdateUserDto.prototype, 'weight');
IsNumber()(UpdateUserDto.prototype, 'weight');

IsOptional()(UpdateUserDto.prototype, 'birthdate');
IsDateString()(UpdateUserDto.prototype, 'birthdate');

IsOptional()(UpdateUserDto.prototype, 'allergies');
IsString()(UpdateUserDto.prototype, 'allergies');

IsOptional()(UpdateUserDto.prototype, 'dietaryRestrictions');
IsString()(UpdateUserDto.prototype, 'dietaryRestrictions');

IsOptional()(UpdateUserDto.prototype, 'healthGoals');
IsString()(UpdateUserDto.prototype, 'healthGoals');

module.exports = { UpdateUserDto }; 
