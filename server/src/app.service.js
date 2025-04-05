const { Injectable } = require('@nestjs/common');

class AppService {
  getHello() {
    return { message: 'Welcome to Health Diet API!' };
  }
}

// Export the class directly
module.exports = { AppService };

// Apply decorator
Injectable()(AppService);
