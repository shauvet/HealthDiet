const { Module } = require('@nestjs/common');
const { MongooseModule } = require('@nestjs/mongoose');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { AppController } = require('./app.controller');
const { AppService } = require('./app.service');

// In JavaScript, we need to use this approach
module.exports = {
  AppModule: class AppModule {},
};

// Apply the Module decorator
Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService) => ({
        uri:
          configService.get('MONGODB_URI') || 'mongodb://localhost/health-diet',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})(module.exports.AppModule);
