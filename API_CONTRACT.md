/**
 * API_CONTRACT.md
 * 
 * This document defines the API endpoints required to migrate from localStorage
 * to a real backend database. All endpoints use JSON.
 * 
 * MIGRATION STEPS:
 * 1. Implement endpoints below in your backend (Node.js, Python, etc.)
 * 2. Set DataService.BASE_URL = 'https://yourapi.com'
 * 3. Set DataService.USE_LOCAL_STORAGE = false
 * 4. No changes needed in app.js or other files!
 * 
 * ============================================================================
 */

/**
 * ============================================================================
 * USER PROFILE ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/users/profile
 * Retrieve the current user's profile
 * 
 * Request: No body (authenticated via token/cookie)
 * 
 * Response (200):
 * {
 *   "id": "user123",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "weight": 185,           // lbs
 *   "age": 28,
 *   "height-ft": 5,
 *   "height-in": 10,
 *   "gender": "male",
 *   "goals": ["muscle-gain", "strength"],
 *   "frequency": "5",        // workouts per week
 *   "equipment": ["dumbbells", "barbell", "treadmill"],
 *   "createdAt": "2024-01-15T08:00:00Z",
 *   "updatedAt": "2024-01-21T12:30:00Z"
 * }
 */

/**
 * POST /api/users/profile
 * Create or update user profile
 * 
 * Request:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "weight": 185,
 *   "age": 28,
 *   "height-ft": 5,
 *   "height-in": 10,
 *   "gender": "male",
 *   "goals": ["muscle-gain", "strength"],
 *   "frequency": "5",
 *   "equipment": ["dumbbells", "barbell"]
 * }
 * 
 * Response (200): Same as GET /api/users/profile
 */

/**
 * ============================================================================
 * LOG ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/logs
 * Get all logs (workouts and nutrition) for current week/time period
 * 
 * Query params:
 * - ?startDate=2024-01-15&endDate=2024-01-21 (ISO format, optional)
 * - ?week=current (default) or ?week=1 for last week, etc.
 * 
 * Response (200):
 * {
 *   "workouts": {
 *     "monday": {
 *       "day": "monday",
 *       "duration": 45,
 *       "activity": "Chest & Triceps: Bench Press 4x8 @ 185 lbs",
 *       "notes": "Felt strong today",
 *       "timestamp": "2024-01-15T10:30:00Z"
 *     },
 *     "tuesday": { ... },
 *     ...
 *   },
 *   "food": {
 *     "monday": {
 *       "day": "monday",
 *       "breakfast": "Oatmeal with protein",
 *       "lunch": "Chicken and rice",
 *       "snack": "Protein shake",
 *       "dinner": "Salmon with broccoli",
 *       "notes": "Hit macros perfectly",
 *       "timestamp": "2024-01-15T20:00:00Z"
 *     },
 *     ...
 *   }
 * }
 */

/**
 * POST /api/logs/workout/{day}
 * Log a workout for a specific day
 * 
 * Request:
 * {
 *   "duration": 45,
 *   "activity": "Chest & Triceps: Bench Press 4x8 @ 185 lbs, Incline DB 3x10 @ 65 lbs",
 *   "notes": "Felt strong, will increase weight next week"
 * }
 * 
 * Response (200):
 * {
 *   "day": "monday",
 *   "duration": 45,
 *   "activity": "Chest & Triceps...",
 *   "notes": "Felt strong...",
 *   "timestamp": "2024-01-15T10:30:00Z"
 * }
 * 
 * Error (400): Invalid day or missing fields
 */

/**
 * POST /api/logs/nutrition/{day}
 * Log nutrition for a specific day
 * 
 * Request:
 * {
 *   "breakfast": "Oatmeal with protein powder and banana",
 *   "lunch": "Grilled chicken breast with rice and broccoli",
 *   "snack": "Protein shake with peanut butter",
 *   "dinner": "Salmon fillet with sweet potato",
 *   "notes": "Stayed within calorie goals"
 * }
 * 
 * Response (200):
 * {
 *   "day": "monday",
 *   "breakfast": "Oatmeal...",
 *   "lunch": "Grilled chicken...",
 *   "snack": "Protein shake...",
 *   "dinner": "Salmon...",
 *   "notes": "Stayed within...",
 *   "timestamp": "2024-01-15T20:00:00Z"
 * }
 */

/**
 * DELETE /api/logs/{type}/{day}
 * Delete a log entry
 * 
 * Params:
 * - type: "workout" or "nutrition"
 * - day: "monday", "tuesday", etc.
 * 
 * Response (200): { "deleted": true }
 */

/**
 * ============================================================================
 * ANALYTICS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/analytics
 * Get computed analytics from user's logs
 * 
 * Response (200):
 * {
 *   "correlations": {
 *     "workoutFrequencyImpact": {
 *       "daysLogged": 4,
 *       "consistency": "57%",
 *       "insight": "Good start, try to hit 4-5 days/week"
 *     },
 *     "exerciseEffectiveness": [
 *       { "exercise": "bench", "frequency": 2 },
 *       { "exercise": "squat", "frequency": 2 },
 *       { "exercise": "row", "frequency": 1 }
 *     ],
 *     "nutritionAlignmentScore": {
 *       "score": 75,
 *       "message": "Great nutrition tracking!"
 *     }
 *   },
 *   "behaviorPatterns": {
 *     "workoutsByDay": {
 *       "monday": "✓",
 *       "tuesday": "✗",
 *       "wednesday": "✓",
 *       ...
 *     },
 *     "preferredDays": ["monday", "wednesday", "friday"],
 *     "streaks": {
 *       "current": 2,
 *       "max": 5
 *     }
 *   },
 *   "progress": {
 *     "workoutsLogged": 4,
 *     "totalMinutes": 180,
 *     "averagePerSession": 45
 *   },
 *   "insights": [
 *     {
 *       "type": "positive",
 *       "title": "Great Start",
 *       "text": "4 workouts logged. Keep this momentum going!"
 *     },
 *     {
 *       "type": "nudge",
 *       "title": "Recovery Time",
 *       "text": "You have 3 rest days planned..."
 *     }
 *   ]
 * }
 */

/**
 * ============================================================================
 * RECOMMENDATIONS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/recommendations
 * Get personalized recommendations based on user profile and logs
 * 
 * Response (200):
 * {
 *   "workoutRecommendations": [
 *     {
 *       "priority": "high",
 *       "text": "Consider adding 1-2 compound movements...",
 *       "action": "View Muscle-Building Exercises"
 *     },
 *     ...
 *   ],
 *   "nutritionRecommendations": [
 *     {
 *       "priority": "high",
 *       "text": "Aim for 0.8-1g of protein per lb...",
 *       "action": "View Protein Sources"
 *     }
 *   ],
 *   "behaviorRecommendations": [
 *     {
 *       "priority": "nudge",
 *       "text": "You tend to work out on Monday and Wednesday...",
 *       "action": "View Your Pattern"
 *     }
 *   ],
 *   "nextSteps": [
 *     { "order": 1, "text": "Log your first workout" },
 *     { "order": 2, "text": "Start tracking at least one meal per day" },
 *     { "order": 3, "text": "After 2-3 weeks of data, we'll show you patterns" }
 *   ]
 * }
 */

/**
 * ============================================================================
 * COMMUNITY ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/community/insights
 * Get community benchmarks and social insights
 * 
 * Response (200):
 * {
 *   "yourStats": {
 *     "workoutsPerWeek": 4,
 *     "totalMinutesPerWeek": 180,
 *     "nutritionConsistency": 75,
 *     "consistency": 4
 *   },
 *   "communityAverages": {
 *     "averageWorkoutsPerWeek": 3.2,
 *     "averageMinutesPerWeek": 180,
 *     "averageNutritionConsistency": 62,
 *     "benchmarkMessage": "You're working out more than the community average!"
 *   },
 *   "benchmarks": [
 *     {
 *       "goal": "Muscle Gain",
 *       "metric": "Average Weekly Workouts",
 *       "communityValue": 4.1,
 *       "userValue": 4,
 *       "percentile": 70
 *     }
 *   ],
 *   "socialMotivation": {
 *     "motivationalMessages": [
 *       {
 *         "type": "achievement",
 *         "text": "Users who log 3+ meals weekly see 40% better results!",
 *         "action": "Log a Meal"
 *       }
 *     ],
 *     "leaderboard": {
 *       "timeframe": "This Week",
 *       "leaders": [
 *         { "rank": 1, "name": "Alex", "workouts": 6, "minutes": 420 },
 *         { "rank": 2, "name": "Morgan", "workouts": 5, "minutes": 325 }
 *       ],
 *       "yourPosition": "Not on leaderboard yet"
 *     }
 *   }
 * }
 */

/**
 * GET /api/community/leaderboard
 * Get current leaderboard (global or filtered by goal)
 * 
 * Query params:
 * - ?goal=muscle-gain (optional)
 * - ?timeframe=week (week, month, all-time)
 * 
 * Response (200):
 * {
 *   "timeframe": "This Week",
 *   "goal": "All Users",
 *   "leaders": [
 *     { "rank": 1, "name": "Alex", "score": 6, "workouts": 6, "minutes": 420, "consistency": "100%" },
 *     { "rank": 2, "name": "Morgan", "score": 5.5, "workouts": 5, "minutes": 325, "consistency": "100%" }
 *   ],
 *   "yourPosition": { "rank": null, "message": "Log more workouts to appear on leaderboard!" }
 * }
 */

/**
 * ============================================================================
 * PROGRESS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/progress
 * Get long-term progress data (weight trends, strength gains, etc.)
 * 
 * Query params:
 * - ?metric=weight (weight, strength, consistency, nutrition)
 * - ?days=30 (last N days, default 30)
 * 
 * Response (200):
 * {
 *   "metric": "weight",
 *   "timeframe": "last 30 days",
 *   "data": [
 *     { "date": "2024-01-01", "value": 190 },
 *     { "date": "2024-01-08", "value": 188 },
 *     { "date": "2024-01-15", "value": 186 },
 *     { "date": "2024-01-21", "value": 185 }
 *   ],
 *   "trend": "down",
 *   "summary": "Lost 5 lbs over 21 days. Average -0.24 lbs/day"
 * }
 */

/**
 * ============================================================================
 * DATABASE SCHEMA (Reference)
 * ============================================================================
 * 
 * Users Table:
 * - id (UUID)
 * - email (string, unique)
 * - name (string)
 * - password_hash (string)
 * - weight (number)
 * - age (number)
 * - height_ft (number)
 * - height_in (number)
 * - gender (string)
 * - goals (JSON array)
 * - frequency (string)
 * - equipment (JSON array)
 * - created_at (timestamp)
 * - updated_at (timestamp)
 * 
 * Workout_Logs Table:
 * - id (UUID)
 * - user_id (UUID, foreign key)
 * - day (string: monday, tuesday, etc.)
 * - date (date)
 * - duration (number, minutes)
 * - activity (text)
 * - notes (text)
 * - created_at (timestamp)
 * - updated_at (timestamp)
 * 
 * Nutrition_Logs Table:
 * - id (UUID)
 * - user_id (UUID, foreign key)
 * - day (string: monday, tuesday, etc.)
 * - date (date)
 * - breakfast (text)
 * - lunch (text)
 * - snack (text)
 * - dinner (text)
 * - notes (text)
 * - calories_estimated (number, optional)
 * - created_at (timestamp)
 * - updated_at (timestamp)
 * 
 * Community_Stats Table:
 * - id (UUID)
 * - date (date)
 * - total_users (number)
 * - active_users (number)
 * - avg_workouts_per_week (number)
 * - avg_nutrition_days (number)
 * - retention_rate (number)
 */

/**
 * ============================================================================
 * IMPLEMENTATION CHECKLIST
 * ============================================================================
 * 
 * Backend Checklist:
 * [ ] Set up database (PostgreSQL recommended)
 * [ ] Create Users table with authentication
 * [ ] Create Workout_Logs table with indexes on user_id, date
 * [ ] Create Nutrition_Logs table with indexes on user_id, date
 * [ ] Implement user authentication (JWT or sessions)
 * [ ] Implement all endpoints above
 * [ ] Add CORS headers for frontend
 * [ ] Add rate limiting
 * [ ] Add input validation
 * [ ] Add error handling
 * [ ] Test endpoints with Postman/Insomnia
 * 
 * Frontend Checklist:
 * [ ] Update DataService.BASE_URL to your API
 * [ ] Set DataService.USE_LOCAL_STORAGE = false
 * [ ] Test all pages work with new endpoints
 * [ ] Implement retry/fallback logic for offline support
 * [ ] Add loading indicators while fetching data
 * [ ] Test authentication flow
 * 
 * Data Migration:
 * [ ] Export localStorage data from early users
 * [ ] Create migration script to seed database
 * [ ] Validate migrated data
 * [ ] Plan user notification of sync
 */
