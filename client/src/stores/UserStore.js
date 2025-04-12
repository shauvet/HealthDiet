import { makeAutoObservable, runInAction } from 'mobx';
import api from '../api/axiosConfig';

class UserStore {
  currentUser = null;
  familyMembers = [];
  loading = false;
  error = null;
  isAuthenticated = false;
  
  constructor() {
    makeAutoObservable(this);
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
    runInAction(() => {
      this.currentUser = null;
      this.isAuthenticated = false;
    });
  }
  
  // Check if token is valid and fetch user data
  async checkAuth() {
    // 首次检查时设置loading为true
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
    
    try {
      // 直接调用API，不要嵌套调用fetchCurrentUser以避免多次设置loading状态
      const response = await api.get('/users/profile');
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
