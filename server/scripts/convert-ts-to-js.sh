#!/bin/bash

# This script converts TypeScript files to JavaScript by:
# 1. Removing type annotations
# 2. Converting imports/exports to require/module.exports
# 3. Applying decorator pattern manually

# Create directories for remaining modules
mkdir -p server/src/recipes/dto
mkdir -p server/src/meal-plans/dto
mkdir -p server/src/meal-plans/schemas
mkdir -p server/src/inventory/dto
mkdir -p server/src/inventory/schemas
mkdir -p server/src/health/dto
mkdir -p server/src/health/schemas

echo "Converting app.module.ts to JavaScript..."
cat > server/src/app.module.js << 'EOF'
const { Module } = require('@nestjs/common');
const { MongooseModule } = require('@nestjs/mongoose');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { AppController } = require('./app.controller');
const { AppService } = require('./app.service');
const { UsersModule } = require('./users/users.module');
const { AuthModule } = require('./auth/auth.module');
const { RecipesModule } = require('./recipes/recipes.module');
const { MealPlansModule } = require('./meal-plans/meal-plans.module');
const { InventoryModule } = require('./inventory/inventory.module');
const { HealthModule } = require('./health/health.module');

const appModule = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService) => ({
        uri:
          configService.get('MONGODB_URI') ||
          'mongodb://localhost/health-diet',
      }),
    }),
    UsersModule,
    AuthModule,
    RecipesModule,
    MealPlansModule,
    InventoryModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
};

module.exports = {
  AppModule: Module(appModule)(class AppModule {})
};
EOF

echo "Converting app.controller.ts to JavaScript..."
cat > server/src/app.controller.js << 'EOF'
const { Controller, Get } = require('@nestjs/common');

class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  getHello() {
    return this.appService.getHello();
  }
}

// Apply decorators
const controller = Controller()(AppController);
Get()(controller.prototype, 'getHello');

module.exports = {
  AppController: controller
};
EOF

echo "Converting app.service.ts to JavaScript..."
cat > server/src/app.service.js << 'EOF'
const { Injectable } = require('@nestjs/common');

class AppService {
  getHello() {
    return { message: 'Welcome to Health Diet API!' };
  }
}

module.exports = {
  AppService: Injectable()(AppService)
};
EOF

echo "Converting main.ts to JavaScript..."
cat > server/src/main.js << 'EOF'
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule.AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
EOF

echo "Conversion completed! TypeScript files have been converted to JavaScript." 
