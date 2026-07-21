/**
 * DataService.js
 * 
 * Abstraction layer for data persistence.
 * Currently uses localStorage, but interface is DB-agnostic.
 * 
 * To switch to real database:
 * 1. Replace localStorage calls with fetch() to your API
 * 2. Update BASE_URL to your backend
 * 3. Implement error handling for network failures
 * 
 * No changes needed in app.js — everything goes through this layer!
 */

class DataService {
  // When ready to use a real database, set this to your API endpoint
  static BASE_URL = null; // e.g., 'https://api.yourserver.com'
  
  static USE_LOCAL_STORAGE = true; // Toggle between localStorage and API

  /**
   * Get user profile
   * @returns {Object} User profile object
   */
  static async getUserProfile() {
    if (this.USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('userProfile')) || null;
    }
    // Production: fetch from API
    // return await fetch(`${this.BASE_URL}/api/users/profile`).then(r => r.json());
  }

  /**
   * Save user profile
   * @param {Object} profile - User profile data
   */
  static async saveUserProfile(profile) {
    if (this.USE_LOCAL_STORAGE) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/users/profile`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(profile)
    // }).then(r => r.json());
  }

  /**
   * Get all user logs (workouts + nutrition)
   * @returns {Object} Logs structured as { workouts: {...}, food: {...} }
   */
  static async getUserLogs() {
    if (this.USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/users/logs`).then(r => r.json());
  }

  /**
   * Save workout log for a specific day
   * @param {string} day - Day name (monday, tuesday, etc.)
   * @param {Object} data - { duration, activity, notes }
   */
  static async saveWorkoutLog(day, data) {
    if (this.USE_LOCAL_STORAGE) {
      const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
      logs.workouts = logs.workouts || {};
      logs.workouts[day] = data;
      localStorage.setItem('userLogs', JSON.stringify(logs));
      return data;
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/logs/workout/${day}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());
  }

  /**
   * Save nutrition log for a specific day
   * @param {string} day - Day name (monday, tuesday, etc.)
   * @param {Object} data - { breakfast, lunch, snack, dinner, notes }
   */
  static async saveNutritionLog(day, data) {
    if (this.USE_LOCAL_STORAGE) {
      const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
      logs.food = logs.food || {};
      logs.food[day] = data;
      localStorage.setItem('userLogs', JSON.stringify(logs));
      return data;
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/logs/nutrition/${day}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());
  }

  /**
   * Get aggregated analytics
   * (Generated from logs and profile data)
   * @returns {Object} Analytics including correlations, patterns, recommendations
   */
  static async getAnalytics() {
    if (this.USE_LOCAL_STORAGE) {
      // Local computation from stored data
      const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
      const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
      const mockCommunity = JSON.parse(localStorage.getItem('mockCommunityData')) || {};
      
      return AnalyticsEngine.compute(profile, logs, mockCommunity);
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/analytics`).then(r => r.json());
  }

  /**
   * Get smart recommendations based on user data
   * @returns {Object} Recommendations for workouts, nutrition, and behavior
   */
  static async getRecommendations() {
    if (this.USE_LOCAL_STORAGE) {
      const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
      const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
      
      return RecommendationEngine.generate(profile, logs);
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/recommendations`).then(r => r.json());
  }

  /**
   * Get community insights and benchmarks
   * @returns {Object} Aggregated insights from similar users
   */
  static async getCommunityInsights() {
    if (this.USE_LOCAL_STORAGE) {
      const mockData = JSON.parse(localStorage.getItem('mockCommunityData')) || {};
      return CommunityAnalytics.compute(mockData);
    }
    // Production:
    // return await fetch(`${this.BASE_URL}/api/community/insights`).then(r => r.json());
  }

  /**
   * Initialize DataService
   * Call once on app startup to check if using real API or localStorage
   */
  static initialize() {
    // Auto-detect if backend is available
    if (this.BASE_URL) {
      this.USE_LOCAL_STORAGE = false;
    }
    console.log(`DataService initialized (${this.USE_LOCAL_STORAGE ? 'localStorage' : 'API'} mode)`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
}
