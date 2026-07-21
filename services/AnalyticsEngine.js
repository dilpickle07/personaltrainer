/**
 * AnalyticsEngine.js
 * 
 * Computes insights from user profile and log data.
 * Finds correlations, patterns, and generates personalized recommendations.
 * 
 * All calculations are local; with real DB, backend can pre-compute these
 * and just return results. This structure makes both approaches seamless.
 */

class AnalyticsEngine {
  /**
   * Main compute function - generates all analytics
   */
  static compute(profile, logs, communityData) {
    return {
      correlations: this.findCorrelations(profile, logs),
      behaviorPatterns: this.analyzeBehaviorPatterns(logs),
      progress: this.calculateProgress(profile, logs),
      insights: this.generateInsights(profile, logs, communityData),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Find correlations between workout/nutrition and progress
   * Example: "Chest days correlate with +0.8% upper body strength"
   */
  static findCorrelations(profile, logs) {
    if (!logs.workouts || Object.keys(logs.workouts).length === 0) {
      return { message: 'Need more workout data to find patterns' };
    }

    const correlations = {
      workoutFrequencyImpact: this.correlateFrequency(logs),
      exerciseEffectiveness: this.rankExercises(logs),
      nutritionAlignmentScore: this.checkNutritionAdherence(profile, logs),
      recoveryPattern: this.analyzeRecovery(logs)
    };

    return correlations;
  }

  /**
   * Correlate workout frequency with consistency
   */
  static correlateFrequency(logs) {
    const workoutDays = Object.keys(logs.workouts || {}).filter(day => 
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    return {
      daysLogged: workoutDays,
      consistency: `${Math.round((workoutDays / 7) * 100)}%`,
      insight: workoutDays >= 4 ? 'Excellent consistency!' : workoutDays >= 2 ? 'Good start, try to hit 4-5 days/week' : 'Try to log at least 2-3 workouts per week'
    };
  }

  /**
   * Rank which exercise types appear most frequently
   */
  static rankExercises(logs) {
    const exerciseFreq = {};
    
    Object.values(logs.workouts || {}).forEach(workout => {
      if (!workout || !workout.activity) return;
      
      // Simple extraction - in production, parse with NLP
      const words = workout.activity.toLowerCase().split(/[\s,]+/);
      const exercises = ['bench', 'squat', 'deadlift', 'pull', 'press', 'row', 'curl', 'cardio', 'bike', 'run'];
      
      words.forEach(word => {
        exercises.forEach(ex => {
          if (word.includes(ex)) {
            exerciseFreq[ex] = (exerciseFreq[ex] || 0) + 1;
          }
        });
      });
    });

    return Object.entries(exerciseFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([exercise, count]) => ({ exercise, frequency: count }));
  }

  /**
   * Check if nutrition logged aligns with profile goals
   */
  static checkNutritionAdherence(profile, logs) {
    const foodDays = Object.keys(logs.food || {}).filter(day => 
      logs.food[day] && (logs.food[day].breakfast || logs.food[day].lunch || logs.food[day].dinner)
    ).length;

    const workoutDays = Object.keys(logs.workouts || {}).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    const adherenceScore = workoutDays > 0 ? Math.round((foodDays / workoutDays) * 100) : 0;

    return {
      score: adherenceScore,
      message: adherenceScore >= 80 ? 'Great nutrition tracking!' : adherenceScore >= 50 ? 'Track nutrition on more workout days' : 'Start logging meals with workouts'
    };
  }

  /**
   * Analyze recovery patterns (rest days, intensity)
   */
  static analyzeRecovery(logs) {
    const durations = Object.values(logs.workouts || {})
      .filter(w => w && w.duration)
      .map(w => w.duration);

    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b) / durations.length) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      averageWorkoutDuration: avgDuration,
      maxWorkoutDuration: maxDuration,
      recoveryRecommendation: maxDuration > 90 ? 'Your longest workouts exceed 90min. Ensure rest days between intense sessions.' : 'Workout intensity looks balanced'
    };
  }

  /**
   * Analyze behavior patterns (when user exercises, consistency trends)
   */
  static analyzeBehaviorPatterns(logs) {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const patterns = {
      workoutsByDay: {},
      preferredDays: [],
      skippedDays: [],
      streaks: this.calculateStreaks(logs)
    };

    dayOrder.forEach(day => {
      const hasWorkout = logs.workouts && logs.workouts[day] && logs.workouts[day].duration > 0;
      patterns.workoutsByDay[day] = hasWorkout ? '✓' : '✗';
      
      if (hasWorkout) patterns.preferredDays.push(day);
      else patterns.skippedDays.push(day);
    });

    return patterns;
  }

  /**
   * Calculate workout streaks
   */
  static calculateStreaks(logs) {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let currentStreak = 0;
    let maxStreak = 0;

    dayOrder.forEach(day => {
      const hasWorkout = logs.workouts && logs.workouts[day] && logs.workouts[day].duration > 0;
      
      if (hasWorkout) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return { current: currentStreak, max: maxStreak };
  }

  /**
   * Calculate overall progress metrics
   */
  static calculateProgress(profile, logs) {
    const workoutDays = Object.keys(logs.workouts || {}).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    const totalDuration = Object.values(logs.workouts || {})
      .reduce((sum, w) => sum + (w && w.duration ? w.duration : 0), 0);

    return {
      workoutsLogged: workoutDays,
      totalMinutes: totalDuration,
      averagePerSession: workoutDays > 0 ? Math.round(totalDuration / workoutDays) : 0,
      progressTrend: 'tracking'
    };
  }

  /**
   * Generate human-readable insights
   */
  static generateInsights(profile, logs, communityData) {
    const insights = [];

    const workoutDays = Object.keys(logs.workouts || {}).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    // Insight 1: Consistency
    if (workoutDays >= 5) {
      insights.push({
        type: 'positive',
        title: 'Fantastic Consistency!',
        text: `You've logged ${workoutDays} workouts this week. You're crushing your goals!`
      });
    } else if (workoutDays >= 3) {
      insights.push({
        type: 'positive',
        title: 'Great Start',
        text: `${workoutDays} workouts logged. Keep this momentum going!`
      });
    } else if (workoutDays > 0) {
      insights.push({
        type: 'nudge',
        title: 'Push a Little Further',
        text: `You've got ${workoutDays} workout${workoutDays !== 1 ? 's' : ''}. Try to hit 2-3 more this week.`
      });
    }

    // Insight 2: Rest days
    const restDays = 7 - workoutDays;
    if (restDays >= 2) {
      insights.push({
        type: 'info',
        title: 'Recovery Time',
        text: `You have ${restDays} rest days planned. This is crucial for muscle growth and preventing burnout.`
      });
    }

    // Insight 3: Nutrition tracking
    const foodDays = Object.keys(logs.food || {}).filter(day =>
      logs.food[day] && (logs.food[day].breakfast || logs.food[day].lunch || logs.food[day].dinner)
    ).length;

    if (foodDays === 0 && profile.goals && profile.goals.includes('fat-loss')) {
      insights.push({
        type: 'nudge',
        title: 'Don\'t Forget Nutrition',
        text: 'Your goal requires tracking food. Start logging meals to see real results!'
      });
    } else if (foodDays >= 5) {
      insights.push({
        type: 'positive',
        title: 'Nutrition Dialed In',
        text: `You've logged meals on ${foodDays} days. This consistency drives results.`
      });
    }

    // Insight 4: Personal record
    const durations = Object.values(logs.workouts || {})
      .filter(w => w && w.duration)
      .map(w => w.duration)
      .sort((a, b) => b - a);

    if (durations.length > 0) {
      insights.push({
        type: 'info',
        title: 'Your Longest Workout',
        text: `${durations[0]} minutes. This shows you can sustain effort and build endurance.`
      });
    }

    return insights;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsEngine;
}
