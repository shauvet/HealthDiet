const { Injectable } = require('@nestjs/common');
const { AuthGuard } = require('@nestjs/passport');

class LocalAuthGuard extends AuthGuard('local') {}

module.exports = {
  LocalAuthGuard: Injectable()(LocalAuthGuard)
}; 
