const { Controller, Post, Body, HttpCode, UseGuards, Request } = require('@nestjs/common');
const { LocalAuthGuard } = require('./guards/local-auth.guard');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(createUserDto) {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  async login(req) {
    return this.authService.login(req.user);
  }
}

// Apply decorators
const controller = Controller('auth')(AuthController);
Post('register')(controller.prototype, 'register');
UseGuards(LocalAuthGuard)(controller.prototype, 'login');
Post('login')(controller.prototype, 'login');
HttpCode(200)(controller.prototype, 'login');
Body()(controller.prototype, 'register', 0);
Request()(controller.prototype, 'login', 0);

module.exports = {
  AuthController: controller
}; 
