const {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum
} = require('class-validator');

class CreateUserDto {}

// Apply decorators
IsNotEmpty()(CreateUserDto.prototype, 'name');
IsString()(CreateUserDto.prototype, 'name');

IsNotEmpty()(CreateUserDto.prototype, 'email');
IsEmail()(CreateUserDto.prototype, 'email');

IsNotEmpty()(CreateUserDto.prototype, 'password');
MinLength(6)(CreateUserDto.prototype, 'password');

IsOptional()(CreateUserDto.prototype, 'phone');
IsString()(CreateUserDto.prototype, 'phone');

IsOptional()(CreateUserDto.prototype, 'gender');
IsEnum(['male', 'female', 'other'])(CreateUserDto.prototype, 'gender');

IsOptional()(CreateUserDto.prototype, 'height');
IsNumber()(CreateUserDto.prototype, 'height');

IsOptional()(CreateUserDto.prototype, 'weight');
IsNumber()(CreateUserDto.prototype, 'weight');

IsOptional()(CreateUserDto.prototype, 'birthdate');
IsDateString()(CreateUserDto.prototype, 'birthdate');

IsOptional()(CreateUserDto.prototype, 'allergies');
IsString()(CreateUserDto.prototype, 'allergies');

IsOptional()(CreateUserDto.prototype, 'dietaryRestrictions');
IsString()(CreateUserDto.prototype, 'dietaryRestrictions');

IsOptional()(CreateUserDto.prototype, 'healthGoals');
IsString()(CreateUserDto.prototype, 'healthGoals');

module.exports = { CreateUserDto }; 
