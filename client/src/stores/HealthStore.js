import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';

// 创建一个配置了基础URL的axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// 添加请求拦截器，设置authorization header
api.interceptors.request.use(config => {
  // 从localStorage获取token，或使用示例token
  const token = localStorage.getItem('authToken') || 'sample-token-1744511696810';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

class HealthStore {
  loading = false;
  error = null;
  
  // 数据状态
  nutrientData = null;
  dietStructure = null;
  nutritionTrends = null;
  vitaminIntake = null;
  mineralIntake = null;
  ingredientUsage = null;
  nutritionAdvice = null;
  ingredientDiversity = null;

  // 时间范围
  timeRange = 'week';
  customDateRange = {
    startDate: null,
    endDate: null
  };

  // 防止重复请求的锁
  _mealPlanNutritionFetchLock = false;
  _allHealthDataFetchLock = false;

  constructor() {
    makeAutoObservable(this);
  }

  setTimeRange(range) {
    this.timeRange = range;
  }

  setCustomDateRange(startDate, endDate) {
    this.customDateRange = { startDate, endDate };
  }

  // 获取已点菜单的营养数据
  async fetchMealPlanNutritionData() {
    // 如果已经有一个请求在进行中，则返回
    if (this._mealPlanNutritionFetchLock) {
      console.log('Meal plan nutrition fetch already in progress, skipping...');
      return null;
    }

    try {
      this._mealPlanNutritionFetchLock = true;
      this.loading = true;
      this.error = null;

      const response = await api.get('/health/nutrition/mealplans');
      
      runInAction(() => {
        const data = response.data;
        this.nutrientData = data.nutrientData;
        this.dietStructure = data.dietStructure;
        this.loading = false;
        this._mealPlanNutritionFetchLock = false;
      });
      
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
        this._mealPlanNutritionFetchLock = false;
      });
      return null;
    }
  }

  // 获取所有健康数据
  async fetchAllHealthData() {
    // 如果已经有一个请求在进行中，则返回
    if (this._allHealthDataFetchLock) {
      console.log('All health data fetch already in progress, skipping...');
      return;
    }

    try {
      this._allHealthDataFetchLock = true;
      this.loading = true;
      this.error = null;

      const params = {
        timeRange: this.timeRange,
        ...(this.timeRange === 'custom' && {
          startDate: this.customDateRange.startDate,
          endDate: this.customDateRange.endDate
        })
      };

      // 先获取已点菜单的营养数据
      await this.fetchMealPlanNutritionData();
      
      // 再获取其他健康数据
      const response = await api.get('/health/all', { params });
      
      runInAction(() => {
        const data = response.data;
        
        // 如果已点菜单没有返回数据，使用默认数据
        if (!this.nutrientData) {
          this.nutrientData = data.nutrientData;
        }
        if (!this.dietStructure) {
          this.dietStructure = data.dietStructure;
        }
        
        this.nutritionTrends = data.nutritionTrends;
        this.vitaminIntake = data.vitaminIntake;
        this.mineralIntake = data.mineralIntake;
        this.ingredientUsage = data.ingredientUsage;
        this.nutritionAdvice = data.nutritionAdvice;
        this.ingredientDiversity = data.ingredientDiversity;
        this.loading = false;
        this._allHealthDataFetchLock = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
        this._allHealthDataFetchLock = false;
      });
    }
  }

  // 获取日均营养摄入数据
  async fetchNutrientData() {
    try {
      const response = await api.get('/health/nutrition/daily');
      runInAction(() => {
        this.nutrientData = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  // 获取营养摄入趋势数据
  async fetchNutritionTrends() {
    try {
      const response = await api.get('/health/nutrition/trends');
      runInAction(() => {
        this.nutritionTrends = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  // 获取维生素摄入数据
  async fetchVitaminIntake() {
    try {
      const response = await api.get('/health/nutrition/vitamins');
      runInAction(() => {
        this.vitaminIntake = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  // 获取矿物质摄入数据
  async fetchMineralIntake() {
    try {
      const response = await api.get('/health/nutrition/minerals');
      runInAction(() => {
        this.mineralIntake = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  // 获取饮食结构数据
  async fetchDietStructure() {
    try {
      const response = await api.get('/health/diet/structure');
      runInAction(() => {
        this.dietStructure = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }
}

export default new HealthStore(); 
