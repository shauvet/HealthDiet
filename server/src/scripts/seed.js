#!/usr/bin/env node

/**
 * 初始化数据库种子数据的脚本
 *
 * 使用方法:
 * $ node seed.js
 *
 * 该脚本将清空现有数据并导入初始样本数据
 */

console.log('开始执行数据库初始化...');
require('./seed-data');
