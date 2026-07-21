/**
 * CommunityAnalytics.js
 * 
 * Generates community insights and social benchmarking.
 * Shows how user's performance compares to similar users.
 * 
 * In production with real DB:
 * - Aggregate stats from all users with similar goals/profiles
 * - Show percentiles, averages, trends
 * - Provide social motivation and community features
 */

class CommunityAnalytics {
  /**
   * Compute community insights
   */
  static compute(communityData) {
    return {
      yourStats: this.getUserStats(),
      communityAverages: this.getCommunityAverages(communityData),
      benchmarks: this.getBenchmarks(communityData),
      socialMotivation: this.getSocialMotivation(communityData)
    };
  }

  /**
   * Get this user's aggregated stats for comparison
   */
  static getUserStats() {
    try {
      const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
      const logs = JSON.parse(localStorage.getItem('userLogs')) || { workouts: {}, food: {} };

      const workoutDays = Object.keys(logs.workouts || {}).filter(day =>
        logs.workouts[day] && logs.workouts[day].duration > 0
      ).length;

      const totalDuration = Object.values(logs.workouts || {})
        .reduce((sum, w) => sum + (w && w.duration ? w.duration : 0), 0);

      const foodDays = Object.keys(logs.food || {}).filter(day =>
        logs.food[day] && (logs.food[day].breakfast || logs.food[day].lunch || logs.food[day].dinner)
      ).length;

      return {
        workoutsPerWeek: workoutDays,
        totalMinutesPerWeek: totalDuration,
        nutritionConsistency: Math.round((foodDays / 7) * 100),
        goals: profile.goals || [],
        consistency: this.getConsistencyScore(logs)
      };
    } catch (e) {
      return {};
    }
  }

  /**
   * Get community averages (simulated with mock data in production mode)
   */
  static getCommunityAverages(communityData) {
    // In production, this comes from backend with aggregated community stats
    const userStats = this.getUserStats();

    return {
      averageWorkoutsPerWeek: 3.2,
      averageMinutesPerWeek: 180,
      averageNutritionConsistency: 62,
      dropoutRate: '35%', // After 2 weeks
      sixMonthRetention: '48%',
      topGoals: ['muscle-gain', 'fat-loss', 'general-fitness'],
      medianAge: 28,
      benchmarkMessage: this.generateBenchmarkMessage(userStats)
    };
  }

  /**
   * Generate personalized benchmark message
   */
  static generateBenchmarkMessage(userStats) {
    if (!userStats.workoutsPerWeek) {
      return 'Start logging workouts to see how you compare!';
    }

    const communityAvg = 3.2;
    const userWorkouts = userStats.workoutsPerWeek;

    if (userWorkouts > communityAvg + 1) {
      return `🔥 You're in the top 15% for consistency. Keep crushing it!`;
    } else if (userWorkouts > communityAvg) {
      return `💪 You're working out more than the community average (${communityAvg}/week)`;
    } else if (userWorkouts === communityAvg) {
      return `✓ You're right at the community average. Try pushing for one more workout!`;
    } else {
      return `🎯 Most users do ${communityAvg} workouts/week. You can do this!`;
    }
  }

  /**
   * Get specific benchmarks for the user's goals
   */
  static getBenchmarks(communityData) {
    const userStats = this.getUserStats();
    const benchmarks = [];

    if (userStats.goals && userStats.goals.includes('muscle-gain')) {
      benchmarks.push({
        goal: 'Muscle Gain',
        metric: 'Average Weekly Workouts',
        communityValue: 4.1,
        userValue: userStats.workoutsPerWeek,
        percentile: this.calculatePercentile(userStats.workoutsPerWeek, 4.1),
        recommendation: userStats.workoutsPerWeek < 4 ? 'Increase to 4-5 workouts/week for optimal muscle growth' : 'Maintain your schedule!'
      });

      benchmarks.push({
        goal: 'Muscle Gain',
        metric: 'Nutrition Tracking Consistency',
        communityValue: 78,
        userValue: userStats.nutritionConsistency,
        percentile: this.calculatePercentile(userStats.nutritionConsistency, 78),
        recommendation: userStats.nutritionConsistency < 70 ? 'Track more meals to fuel growth' : 'Great nutrition discipline!'
      });
    }

    if (userStats.goals && userStats.goals.includes('fat-loss')) {
      benchmarks.push({
        goal: 'Fat Loss',
        metric: 'Weekly Workouts',
        communityValue: 4.3,
        userValue: userStats.workoutsPerWeek,
        percentile: this.calculatePercentile(userStats.workoutsPerWeek, 4.3),
        recommendation: userStats.workoutsPerWeek < 4 ? 'Increase frequency for faster results' : 'Excellent frequency!'
      });

      benchmarks.push({
        goal: 'Fat Loss',
        metric: 'Nutrition Logging',
        communityValue: 85,
        userValue: userStats.nutritionConsistency,
        percentile: this.calculatePercentile(userStats.nutritionConsistency, 85),
        recommendation: userStats.nutritionConsistency < 80 ? 'Nutrition tracking is key to fat loss. Log everything!' : 'Your tracking is excellent!'
      });
    }

    if (userStats.goals && userStats.goals.includes('endurance')) {
      benchmarks.push({
        goal: 'Endurance',
        metric: 'Average Workout Duration (mins)',
        communityValue: 45,
        userValue: userStats.totalMinutesPerWeek > 0 ? Math.round(userStats.totalMinutesPerWeek / userStats.workoutsPerWeek) : 0,
        percentile: this.calculatePercentile(userStats.totalMinutesPerWeek / Math.max(userStats.workoutsPerWeek, 1), 45),
        recommendation: 'Gradually increase duration by 10% each week'
      });
    }

    return benchmarks;
  }

  /**
   * Get social/motivational content
   */
  static getSocialMotivation(communityData) {
    const userStats = this.getUserStats();

    return {
      motivationalMessages: [
        {
          type: 'achievement',
          text: 'Did you know? Users who log 3+ meals weekly see 40% better results!',
          action: 'Log a Meal'
        },
        {
          type: 'social',
          text: 'Join 12,000+ members on their fitness journey',
          action: 'View Community'
        },
        {
          type: 'challenge',
          text: 'This month\'s challenge: 7-day workout streak',
          action: 'Start Challenge'
        }
      ],
      successStories: [
        {
          goal: 'Fat Loss',
          timeframe: '12 weeks',
          result: 'Lost 18 lbs, gained confidence',
          adherence: '91% consistency'
        },
        {
          goal: 'Muscle Gain',
          timeframe: '16 weeks',
          result: 'Gained 12 lbs lean muscle',
          adherence: '87% consistency'
        }
      ],
      peerComparison: this.getPeerComparison(userStats),
      leaderboard: this.getLeaderboard()
    };
  }

  /**
   * Compare user to similar peers
   */
  static getPeerComparison(userStats) {
    const similarUsers = [
      { name: 'Sam', goals: ['muscle-gain'], workoutsPerWeek: 5, consistency: 92 },
      { name: 'Alex', goals: ['muscle-gain', 'strength'], workoutsPerWeek: 4, consistency: 85 },
      { name: 'Jordan', goals: ['muscle-gain'], workoutsPerWeek: 3, consistency: 71 },
    ];

    return {
      message: `You're with ${similarUsers.length} others pursuing your goals`,
      peers: similarUsers,
      yourRank: 'Top 25%'
    };
  }

  /**
   * Get leaderboard for motivation
   */
  static getLeaderboard() {
    return {
      timeframe: 'This Week',
      leaders: [
        { rank: 1, name: 'Alex', workouts: 6, minutes: 420, consistency: '100%' },
        { rank: 2, name: 'Morgan', workouts: 5, minutes: 325, consistency: '100%' },
        { rank: 3, name: 'Casey', workouts: 5, minutes: 310, consistency: '100%' },
      ],
      yourPosition: 'Not on leaderboard yet - log more workouts to climb!'
    };
  }

  /**
   * Helper: Calculate consistency score
   */
  static getConsistencyScore(logs) {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activeWorkoutDays = dayOrder.filter(day =>
      logs.workouts && logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    return activeWorkoutDays; // Return count for now, can be percentage
  }

  /**
   * Calculate percentile ranking
   */
  static calculatePercentile(userValue, communityAvg) {
    if (communityAvg === 0) return 50;
    
    const ratio = userValue / communityAvg;
    
    if (ratio >= 1.2) return 85;
    if (ratio >= 1.0) return 70;
    if (ratio >= 0.8) return 50;
    if (ratio >= 0.6) return 30;
    return 15;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommunityAnalytics;
}
