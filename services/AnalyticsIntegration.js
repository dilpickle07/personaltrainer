/**
 * AnalyticsIntegration.js
 * 
 * Demonstrates how to use the DataService and analytics modules
 * to power intelligent recommendations and insights.
 * 
 * This file shows the integration pattern for a new Insights/Analytics page.
 * Can be loaded on demand or on any page via dynamic import.
 */

class AnalyticsIntegration {
  /**
   * Initialize analytics system
   * Call this once on app startup
   */
  static async initialize() {
    console.log('Initializing Analytics Integration...');
    
    // Initialize DataService
    DataService.initialize();
    
    // Load mock community data if it doesn't exist
    if (!localStorage.getItem('mockCommunityData')) {
      this.generateMockCommunityData();
    }
  }

  /**
   * Load all analytics and recommendations
   * Returns an object with correlations, patterns, recommendations, and community insights
   */
  static async loadAllInsights() {
    try {
      const [analytics, recommendations, community] = await Promise.all([
        DataService.getAnalytics(),
        DataService.getRecommendations(),
        DataService.getCommunityInsights()
      ]);

      return {
        analytics,
        recommendations,
        community,
        loadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to load insights:', error);
      return null;
    }
  }

  /**
   * Get specific insight type
   */
  static async getCorrelations() {
    const insights = await DataService.getAnalytics();
    return insights.correlations;
  }

  static async getBehaviorPatterns() {
    const insights = await DataService.getAnalytics();
    return insights.behaviorPatterns;
  }

  static async getPersonalInsights() {
    const insights = await DataService.getAnalytics();
    return insights.insights;
  }

  /**
   * Generate sample data for demo/development
   * In production, remove this and fetch real community stats from backend
   */
  static generateMockCommunityData() {
    const mockData = {
      totalUsers: 12432,
      activeUsers: 8934,
      avgWorkoutsPerWeek: 3.2,
      avgNutritionTracking: 62,
      retentionRate: 0.48,
      goalDistribution: {
        'muscle-gain': 0.35,
        'fat-loss': 0.30,
        'general-fitness': 0.20,
        'strength': 0.10,
        'endurance': 0.04,
        'age-well': 0.01
      },
      successStories: [
        { goal: 'fat-loss', duration: '12 weeks', result: 'Lost 18 lbs', adherence: 0.91 },
        { goal: 'muscle-gain', duration: '16 weeks', result: '12 lbs lean muscle', adherence: 0.87 },
        { goal: 'strength', duration: '8 weeks', result: '40% strength increase', adherence: 0.93 }
      ]
    };

    localStorage.setItem('mockCommunityData', JSON.stringify(mockData));
    console.log('Mock community data generated');
  }

  /**
   * Format insights for display in UI
   */
  static formatInsightForDisplay(insight) {
    return {
      title: insight.title || 'Insight',
      message: insight.text || insight.message || '',
      type: insight.type || 'info', // 'positive', 'nudge', 'warning', 'info'
      action: insight.action || null
    };
  }

  /**
   * Check if user has enough data for meaningful analytics
   */
  static hasEnoughData() {
    const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
    
    const workoutCount = Object.values(logs.workouts || {})
      .filter(w => w && w.duration > 0).length;
    
    const foodCount = Object.values(logs.food || {})
      .filter(f => f && (f.breakfast || f.lunch || f.dinner)).length;

    // Need at least 3 workouts and 2 nutrition logs for meaningful analysis
    return workoutCount >= 3 && foodCount >= 2;
  }

  /**
   * Get data readiness score (0-100)
   * Shows user how close they are to getting detailed insights
   */
  static getDataReadinessScore() {
    const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };
    
    const workoutCount = Math.min(
      Object.values(logs.workouts || {}).filter(w => w && w.duration > 0).length,
      7 // Cap at 1 week
    );
    
    const foodCount = Math.min(
      Object.values(logs.food || {}).filter(f => f && (f.breakfast || f.lunch || f.dinner)).length,
      7
    );

    const workoutScore = (workoutCount / 7) * 50; // 0-50
    const foodScore = (foodCount / 7) * 50;       // 0-50

    return Math.round(workoutScore + foodScore);
  }

  /**
   * Example: Use analytics in a page
   * Shows how to integrate insights into your UI
   */
  static async renderInsightsWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const readiness = this.getDataReadinessScore();
    
    if (readiness < 50) {
      container.innerHTML = `
        <div class="insights-placeholder">
          <h3>Coming Soon: Your Personalized Insights</h3>
          <p>Keep logging workouts and meals. After 1-2 weeks of data, we'll show you:</p>
          <ul>
            <li>What exercises work best for your goals</li>
            <li>Nutrition patterns that drive results</li>
            <li>Personalized recommendations</li>
            <li>How you compare to similar users</li>
          </ul>
          <div class="readiness-bar">
            <div class="readiness-fill" style="width: ${readiness}%"></div>
          </div>
          <p class="readiness-text">${readiness}% ready</p>
        </div>
      `;
      return;
    }

    // Load and display actual insights
    const insights = await this.loadAllInsights();
    if (!insights) return;

    const personalInsights = insights.analytics.insights || [];
    const recommendations = insights.recommendations.workoutRecommendations || [];
    const community = insights.community.yourStats || {};

    let html = '<div class="insights-container">';

    // Personal insights
    if (personalInsights.length > 0) {
      html += '<section class="insights-section"><h3>Your Insights</h3>';
      personalInsights.forEach(insight => {
        html += `
          <div class="insight-card insight-${insight.type}">
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
          </div>
        `;
      });
      html += '</section>';
    }

    // Recommendations
    if (recommendations.length > 0) {
      html += '<section class="insights-section"><h3>Recommendations</h3>';
      recommendations.slice(0, 3).forEach(rec => {
        html += `
          <div class="recommendation-card">
            <p>${rec.text}</p>
            ${rec.action ? `<button class="btn-small">${rec.action}</button>` : ''}
          </div>
        `;
      });
      html += '</section>';
    }

    // Community stats
    if (community.workoutsPerWeek) {
      html += `
        <section class="insights-section">
          <h3>Community Benchmark</h3>
          <p>You: ${community.workoutsPerWeek} workouts/week</p>
          <p>Community Average: 3.2 workouts/week</p>
          <p>${community.workoutsPerWeek > 3.2 ? '✓ You\'re above average!' : 'Try to increase by one workout/week'}</p>
        </section>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }
}

// Initialize on load if this script is included
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AnalyticsIntegration.initialize();
  });
} else {
  AnalyticsIntegration.initialize();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsIntegration;
}
