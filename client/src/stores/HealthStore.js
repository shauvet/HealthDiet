import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';

// 创建一个配置了基础URL的axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
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

  constructor() {
    makeAutoObservable(this);
  }

  setTimeRange(range) {
    this.timeRange = range;
  }

  setCustomDateRange(startDate, endDate) {
    this.customDateRange = { startDate, endDate };
  }

  // 获取所有健康数据
  async fetchAllHealthData() {
    try {
      this.loading = true;
      this.error = null;

      const params = {
        timeRange: this.timeRange,
        ...(this.timeRange === 'custom' && {
          startDate: this.customDateRange.startDate,
          endDate: this.customDateRange.endDate
        })
      };

      const response = await api.get('/health/all', { params });
      
      runInAction(() => {
        const data = response.data;
        this.nutrientData = data.nutrientData;
        this.dietStructure = data.dietStructure;
        this.nutritionTrends = data.nutritionTrends;
        this.vitaminIntake = data.vitaminIntake;
        this.mineralIntake = data.mineralIntake;
        this.ingredientUsage = data.ingredientUsage;
        this.nutritionAdvice = data.nutritionAdvice;
        this.ingredientDiversity = data.ingredientDiversity;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
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
