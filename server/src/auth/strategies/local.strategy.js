const { Injectable, UnauthorizedException } = require('@nestjs/common');
const { PassportStrategy } = require('@nestjs/passport');
const { Strategy } = require('passport-local');

class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(authService) {
    super({
      usernameField: 'email',
    });
    this.authService = authService;
  }

  async validate(email, password) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}

module.exports = {
  LocalStrategy: Injectable()(LocalStrategy)
}; 
