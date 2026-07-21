/**
 * backend/src/server.js
 * 
 * Express.js server using DatabaseFactory.
 * Works with PostgreSQL, MongoDB, or both!
 * 
 * Install: npm install express cors dotenv
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DatabaseFactory = require('./database/DatabaseFactory');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// INITIALIZE DATABASE
// ============================================================================

async function initializeApp() {
  try {
    await DatabaseFactory.initialize();
    const db = DatabaseFactory.getInstance();

    // ========================================================================
    // USER ENDPOINTS
    // ========================================================================

    // GET /api/users/profile
    app.get('/api/users/profile', async (req, res) => {
      try {
        const userId = req.headers['x-user-id']; // In production, from JWT token
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await db.users.findById(userId);
        res.json(user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
      }
    });

    // POST /api/users/profile
    app.post('/api/users/profile', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const updated = await db.users.update(userId, req.body);
        res.json(updated);
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
      }
    });

    // ========================================================================
    // WORKOUT LOG ENDPOINTS
    // ========================================================================

    // GET /api/logs
    app.get('/api/logs', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workouts = await db.workoutLogs.findByUserThisWeek(userId);
        const nutrition = await db.nutritionLogs.findByUserThisWeek(userId);

        res.json({ workouts, nutrition });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
      }
    });

    // POST /api/logs/workout/{day}
    app.post('/api/logs/workout/:day', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workoutData = {
          user_id: userId,
          day: req.params.day,
          ...req.body
        };

        const workout = await db.workoutLogs.create(workoutData);
        res.json(workout);
      } catch (error) {
        console.error('Error saving workout:', error);
        res.status(500).json({ error: 'Failed to save workout' });
      }
    });

    // ========================================================================
    // NUTRITION LOG ENDPOINTS
    // ========================================================================

    // POST /api/logs/nutrition/{day}
    app.post('/api/logs/nutrition/:day', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const nutritionData = {
          user_id: userId,
          day: req.params.day,
          ...req.body
        };

        const nutrition = await db.nutritionLogs.create(nutritionData);
        res.json(nutrition);
      } catch (error) {
        console.error('Error saving nutrition:', error);
        res.status(500).json({ error: 'Failed to save nutrition' });
      }
    });

    // ========================================================================
    // ANALYTICS ENDPOINTS
    // ========================================================================

    // GET /api/analytics
    app.get('/api/analytics', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await db.users.findById(userId);
        const logs = {
          workouts: await db.workoutLogs.findByUserThisWeek(userId),
          food: await db.nutritionLogs.findByUserThisWeek(userId)
        };

        // Here you'd call AnalyticsEngine.compute(user, logs)
        // For now, send raw data
        res.json({
          profile: user,
          logs: logs,
          message: 'Use AnalyticsEngine.compute() on frontend to analyze'
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    });

    // GET /api/recommendations
    app.get('/api/recommendations', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await db.users.findById(userId);
        const logs = {
          workouts: await db.workoutLogs.findByUserThisWeek(userId),
          food: await db.nutritionLogs.findByUserThisWeek(userId)
        };

        // Here you'd call RecommendationEngine.generate(user, logs)
        res.json({
          message: 'Use RecommendationEngine.generate() on frontend',
          profile: user,
          logsCount: {
            workouts: logs.workouts.length,
            nutrition: logs.food.length
          }
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
      }
    });

    // GET /api/community/insights
    app.get('/api/community/insights', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Aggregate stats from all users
        const allUsers = await db.users.findAll();
        const allWorkouts = await db.workoutLogs.findAll();

        const avgWorkoutsPerWeek = allWorkouts.length / Math.max(allUsers.length, 1);

        res.json({
          totalUsers: allUsers.length,
          avgWorkoutsPerWeek,
          yourStats: { /* populated from user logs */ },
          leaderboard: []
        });
      } catch (error) {
        console.error('Error fetching community insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
      }
    });

    // ========================================================================
    // HEALTH CHECK
    // ========================================================================

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', database: process.env.DATABASE_TYPE });
    });

    // ========================================================================
    // START SERVER
    // ========================================================================

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`📊 Database Type: ${process.env.DATABASE_TYPE}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await DatabaseFactory.disconnect();
  process.exit(0);
});

initializeApp();
