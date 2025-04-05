const { Injectable } = require('@nestjs/common');
const { PassportStrategy } = require('@nestjs/passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'supersecret',
    });
    this.configService = configService;
  }

  async validate(payload) {
    return { userId: payload.sub, email: payload.email };
  }
}

module.exports = {
  JwtStrategy: Injectable()(JwtStrategy)
}; 
