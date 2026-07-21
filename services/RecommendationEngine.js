/**
 * RecommendationEngine.js
 * 
 * Generates personalized recommendations based on user profile and logs.
 * Suggests workout variations, nutrition adjustments, and behavior changes.
 */

class RecommendationEngine {
  /**
   * Generate all recommendations
   */
  static generate(profile, logs) {
    return {
      workoutRecommendations: this.generateWorkoutRecommendations(profile, logs),
      nutritionRecommendations: this.generateNutritionRecommendations(profile, logs),
      behaviorRecommendations: this.generateBehaviorRecommendations(logs),
      nextSteps: this.getNextSteps(profile, logs)
    };
  }

  /**
   * Suggest workout variations based on logged exercises
   */
  static generateWorkoutRecommendations(profile, logs) {
    const recommendations = [];

    if (!logs.workouts || Object.keys(logs.workouts).length === 0) {
      return [{
        priority: 'high',
        text: 'Start logging your first workout to get personalized suggestions',
        action: 'Log a Workout'
      }];
    }

    // Analyze what exercises they're doing
    const exerciseFreq = this.getExerciseFrequency(logs);
    
    // Goal-based recommendations
    if (profile.goals && profile.goals.includes('muscle-gain')) {
      recommendations.push({
        priority: 'high',
        text: 'Consider adding 1-2 compound movements (bench, squat, deadlift) if you haven\'t recently',
        action: 'View Muscle-Building Exercises'
      });

      if (Object.keys(logs.workouts).length >= 3) {
        recommendations.push({
          priority: 'medium',
          text: 'Your current frequency supports muscle gain. Try progressively increasing weight each week.',
          action: 'Progressive Overload Tips'
        });
      }
    }

    if (profile.goals && profile.goals.includes('fat-loss')) {
      recommendations.push({
        priority: 'high',
        text: 'Mix in 2-3 cardio sessions per week to maximize fat loss',
        action: 'Cardio Workout Plans'
      });
    }

    if (profile.goals && profile.goals.includes('endurance')) {
      recommendations.push({
        priority: 'high',
        text: 'Gradually increase your longest workout duration by 5-10% weekly',
        action: 'Endurance Training'
      });
    }

    // Pattern-based recommendations
    if (exerciseFreq.length === 0) {
      recommendations.push({
        priority: 'medium',
        text: 'Add more detail to your workout notes (exercise names, sets, reps) for better insights',
        action: 'Edit Past Workouts'
      });
    }

    // Workout frequency check
    const workoutDays = Object.keys(logs.workouts).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    if (profile.frequency && workoutDays < parseInt(profile.frequency)) {
      recommendations.push({
        priority: 'medium',
        text: `You planned ${profile.frequency} workouts per week but logged ${workoutDays}. Let's get back on track!`,
        action: 'Schedule Next Workout'
      });
    }

    return recommendations;
  }

  /**
   * Suggest nutrition adjustments
   */
  static generateNutritionRecommendations(profile, logs) {
    const recommendations = [];

    const foodDays = Object.keys(logs.food || {}).filter(day =>
      logs.food[day] && (logs.food[day].breakfast || logs.food[day].lunch || logs.food[day].dinner)
    ).length;

    // Nutrition logging
    if (foodDays === 0) {
      recommendations.push({
        priority: 'high',
        text: 'Start tracking meals to complement your workouts and reach your goals faster',
        action: 'Log Your First Meal'
      });
    } else if (foodDays < 3) {
      recommendations.push({
        priority: 'medium',
        text: 'Track meals on more days to build consistency and see patterns',
        action: 'Log Today\'s Meals'
      });
    }

    // Goal-specific nutrition advice
    if (profile.goals && profile.goals.includes('muscle-gain')) {
      recommendations.push({
        priority: 'high',
        text: 'Aim for 0.8-1g of protein per lb of body weight. Your target: ~160g daily.',
        action: 'View Protein Sources'
      });
    }

    if (profile.goals && profile.goals.includes('fat-loss')) {
      recommendations.push({
        priority: 'high',
        text: 'Create a moderate calorie deficit (300-500 below maintenance). Current estimate: 1900 cal/day',
        action: 'View Fat-Loss Meals'
      });
    }

    if (profile.goals && profile.goals.includes('strength')) {
      recommendations.push({
        priority: 'medium',
        text: 'Prioritize carbs on heavy lifting days (40-45% of calories) for performance',
        action: 'View Pre-Workout Meals'
      });
    }

    return recommendations;
  }

  /**
   * Behavioral recommendations (when to train, rest, etc.)
   */
  static generateBehaviorRecommendations(logs) {
    const recommendations = [];

    // Analyze when they work out
    const workoutDays = this.getWorkoutDayDistribution(logs);
    const preferredDays = Object.entries(workoutDays)
      .filter(([day, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => day);

    if (preferredDays.length > 0) {
      recommendations.push({
        priority: 'info',
        text: `You tend to work out on ${preferredDays.join(' and ')}. This is great for building habit!`,
        action: 'View Your Pattern'
      });
    }

    // Streak-based recommendation
    const streaks = this.getStreaks(logs);
    if (streaks.current >= 3) {
      recommendations.push({
        priority: 'positive',
        text: `You're on a ${streaks.current}-day workout streak! Keep the momentum going.`,
        action: 'Continue Streak'
      });
    } else if (streaks.current === 0 && streaks.max > 0) {
      recommendations.push({
        priority: 'nudge',
        text: `You broke your streak. Your personal best was ${streaks.max} days. Let's start a new one!`,
        action: 'Log a Workout'
      });
    }

    // Rest day reminder
    const workoutCount = Object.keys(logs.workouts || {}).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length;

    if (workoutCount >= 5) {
      recommendations.push({
        priority: 'high',
        text: 'You\'ve had 5+ active days this week. Take 1-2 complete rest days for recovery.',
        action: 'Plan Rest Days'
      });
    }

    return recommendations;
  }

  /**
   * Get next steps to move forward
   */
  static getNextSteps(profile, logs) {
    const steps = [];

    const hasWorkouts = Object.keys(logs.workouts || {}).filter(day =>
      logs.workouts[day] && logs.workouts[day].duration > 0
    ).length > 0;

    const hasNutrition = Object.keys(logs.food || {}).filter(day =>
      logs.food[day] && (logs.food[day].breakfast || logs.food[day].lunch)
    ).length > 0;

    if (!hasWorkouts) {
      steps.push({ order: 1, text: 'Log your first workout' });
    } else {
      steps.push({ order: 1, text: 'Continue logging workouts consistently' });
    }

    if (!hasNutrition) {
      steps.push({ order: 2, text: 'Start tracking at least one meal per day' });
    } else {
      steps.push({ order: 2, text: 'Log nutrition for all workout days' });
    }

    steps.push({ 
      order: 3, 
      text: 'After 2-3 weeks of data, we\'ll show you personalized patterns and correlations' 
    });

    return steps;
  }

  // ===== Helper Methods =====

  static getExerciseFrequency(logs) {
    const exerciseFreq = {};
    
    Object.values(logs.workouts || {}).forEach(workout => {
      if (!workout || !workout.activity) return;
      
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
      .slice(0, 5)
      .map(([exercise, count]) => ({ exercise, frequency: count }));
  }

  static getWorkoutDayDistribution(logs) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const distribution = {};

    days.forEach(day => {
      distribution[day] = (logs.workouts && logs.workouts[day] && logs.workouts[day].duration > 0) ? 1 : 0;
    });

    return distribution;
  }

  static getStreaks(logs) {
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
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
}
