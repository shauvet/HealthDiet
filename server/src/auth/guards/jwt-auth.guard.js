const { Injectable } = require('@nestjs/common');
const { AuthGuard } = require('@nestjs/passport');

class JwtAuthGuard extends AuthGuard('jwt') {}

module.exports = {
  JwtAuthGuard: Injectable()(JwtAuthGuard)
}; 
