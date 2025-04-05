const { Controller, Get } = require('@nestjs/common');
const { AppService } = require('./app.service');

// Create a simple class
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  getHello() {
    return this.appService.getHello();
  }
}

// Apply decorators manually
const decorated = Controller()(AppController);
Get()(decorated.prototype, 'getHello');

// Export the decorated controller
module.exports = { AppController: decorated };
