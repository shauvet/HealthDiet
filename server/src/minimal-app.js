const { NestFactory } = require('@nestjs/core');
const { Module, Controller, Get, Injectable } = require('@nestjs/common');

// Create a simple service
class AppService {
  getHello() {
    return { message: 'Welcome to Health Diet API!' };
  }
}
Injectable()(AppService);

// Create a simple controller
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  getHello() {
    return this.appService.getHello();
  }
}
Controller()(AppController);
Get()(AppController.prototype, 'getHello');

// Create a simple module
class AppModule {}
Module({
  controllers: [AppController],
  providers: [AppService],
})(AppModule);

// Bootstrap the application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3001);
  console.log('Server running on http://localhost:3001/api');
}

bootstrap();
