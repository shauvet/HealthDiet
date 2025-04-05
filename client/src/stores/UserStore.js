import { makeAutoObservable } from 'mobx';
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
    this.loading = true;
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      await this.fetchCurrentUser();
      this.isAuthenticated = true;
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response ? error.response.data.message : error.message;
      this.isAuthenticated = false;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Register user
  async register(userData) {
    this.loading = true;
    try {
      await api.post('/auth/register', userData);
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response ? error.response.data.message : error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Logout user
  logout() {
    localStorage.removeItem('token');
    this.currentUser = null;
    this.isAuthenticated = false;
  }
  
  // Check if token is valid and fetch user data
  async checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isAuthenticated = false;
      return false;
    }
    
    try {
      await this.fetchCurrentUser();
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      return false;
    }
  }
  
  // Fetch current user profile
  async fetchCurrentUser() {
    this.loading = true;
    try {
      const response = await api.get('/users/profile');
      this.currentUser = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  // Update user profile
  async updateProfile(profileData) {
    this.loading = true;
    try {
      const response = await api.patch('/users/profile', profileData);
      this.currentUser = response.data;
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch family members
  async fetchFamilyMembers() {
    this.loading = true;
    try {
      const response = await api.get('/users/family');
      this.familyMembers = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Add family member
  async addFamilyMember(memberData) {
    this.loading = true;
    try {
      await api.post('/users/family', memberData);
      await this.fetchFamilyMembers();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Update family member
  async updateFamilyMember(memberId, memberData) {
    this.loading = true;
    try {
      await api.patch(`/users/family/${memberId}`, memberData);
      await this.fetchFamilyMembers();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
  
  // Remove family member
  async removeFamilyMember(memberId) {
    this.loading = true;
    try {
      await api.delete(`/users/family/${memberId}`);
      await this.fetchFamilyMembers();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
}

export default new UserStore(); 
