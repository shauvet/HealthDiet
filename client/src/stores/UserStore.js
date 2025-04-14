import { makeAutoObservable, runInAction } from 'mobx';
import api from '../api/axiosConfig';

class UserStore {
  currentUser = null;
  familyMembers = [];
  loading = false;
  error = null;
  isAuthenticated = false;
  darkMode = false;
  
  constructor() {
    makeAutoObservable(this);
    // Check if darkMode was stored in localStorage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      this.darkMode = storedDarkMode === 'true';
    }
  }
  
  // Toggle dark mode
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    return this.darkMode;
  }
  
  // Login user
  async login(credentials) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      await this.fetchCurrentUser();
      runInAction(() => {
        this.isAuthenticated = true;
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response ? error.response.data.message : error.message;
        this.isAuthenticated = false;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Register user
  async register(userData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.post('/auth/register', userData);
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response ? error.response.data.message : error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfileCache');
    runInAction(() => {
      this.currentUser = null;
      this.isAuthenticated = false;
    });
  }
  
  // Check if token is valid and fetch user data
  async checkAuth() {
    runInAction(() => {
      this.loading = true;
    });
    
    const token = localStorage.getItem('token');
    if (!token) {
      runInAction(() => {
        this.isAuthenticated = false;
        this.loading = false;
      });
      return false;
    }
    
    // 如果已经有用户信息，那么不需要再发请求
    if (this.currentUser && Object.keys(this.currentUser).length > 0) {
      runInAction(() => {
        this.isAuthenticated = true;
        this.loading = false;
      });
      return true;
    }
    
    // 添加缓存时间检查
    const userProfileCache = localStorage.getItem('userProfileCache');
    const now = new Date().getTime();
    
    if (userProfileCache) {
      const { data, timestamp } = JSON.parse(userProfileCache);
      // 如果缓存的用户信息在10分钟内，直接使用缓存
      if (now - timestamp < 10 * 60 * 1000) {
        runInAction(() => {
          this.currentUser = data;
          this.isAuthenticated = true;
          this.error = null;
          this.loading = false;
        });
        console.log('Using cached user profile');
        return true;
      }
    }
    
    try {
      // 直接调用API，不要嵌套调用fetchCurrentUser以避免多次设置loading状态
      const response = await api.get('/users/profile');
      
      // 缓存用户信息到localStorage
      localStorage.setItem('userProfileCache', JSON.stringify({
        data: response.data,
        timestamp: now
      }));
      
      runInAction(() => {
        this.currentUser = response.data;
        this.isAuthenticated = true;
        this.error = null;
        this.loading = false;
      });
      return true;
    } catch (error) {
      console.log(error);
      localStorage.removeItem('token');
      localStorage.removeItem('userProfileCache');
      runInAction(() => {
        this.isAuthenticated = false;
        this.loading = false;
      });
      return false;
    }
  }
  
  // Fetch current user profile
  async fetchCurrentUser() {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get('/users/profile');
      
      // 更新缓存
      localStorage.setItem('userProfileCache', JSON.stringify({
        data: response.data,
        timestamp: new Date().getTime()
      }));
      
      runInAction(() => {
        this.currentUser = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Update user profile
  async updateProfile(profileData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.patch('/users/profile', profileData);
      
      // 更新缓存
      localStorage.setItem('userProfileCache', JSON.stringify({
        data: response.data,
        timestamp: new Date().getTime()
      }));
      
      runInAction(() => {
        this.currentUser = response.data;
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Fetch family members
  async fetchFamilyMembers() {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await api.get('/users/family');
      runInAction(() => {
        this.familyMembers = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Add family member
  async addFamilyMember(memberData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.post('/users/family', memberData);
      await this.fetchFamilyMembers();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Update family member
  async updateFamilyMember(memberId, memberData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.patch(`/users/family/${memberId}`, memberData);
      await this.fetchFamilyMembers();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  
  // Remove family member
  async removeFamilyMember(memberId) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await api.delete(`/users/family/${memberId}`);
      await this.fetchFamilyMembers();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default new UserStore(); 
