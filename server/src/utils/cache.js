/**
 * 简单的内存缓存实现
 */
class Cache {
  constructor() {
    this.cache = {};
    this.timeouts = {};
  }

  /**
   * 设置缓存项
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间(毫秒)
   */
  set(key, value, ttl = 24 * 60 * 60 * 1000) {
    // 默认24小时
    // 如果已存在此键的过期计时器，先清除
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }

    // 存储值
    this.cache[key] = {
      value,
      timestamp: Date.now(),
    };

    // 设置过期计时器
    this.timeouts[key] = setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * 获取缓存项
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存值，不存在则返回null
   */
  get(key) {
    const item = this.cache[key];
    if (!item) return null;
    return item.value;
  }

  /**
   * 检查缓存项是否存在
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    return !!this.cache[key];
  }

  /**
   * 删除缓存项
   * @param {string} key - 缓存键
   */
  delete(key) {
    delete this.cache[key];
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.timeouts[key];
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache = {};
    for (const key in this.timeouts) {
      clearTimeout(this.timeouts[key]);
    }
    this.timeouts = {};
  }
}

// 创建并导出单例
const cache = new Cache();
module.exports = cache;
