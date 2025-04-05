const { Module } = require('@nestjs/common');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { AuthService } = require('./auth.service');
const { AuthController } = require('./auth.controller');
const { UsersModule } = require('../users/users.module');
const { JwtStrategy } = require('./strategies/jwt.strategy');
const { LocalStrategy } = require('./strategies/local.strategy');

const authModule = {
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService) => ({
        secret: configService.get('JWT_SECRET') || 'supersecret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
};

module.exports = {
  AuthModule: Module(authModule)(class AuthModule {})
}; 
