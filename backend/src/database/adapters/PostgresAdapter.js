/**
 * backend/src/database/adapters/PostgresAdapter.js
 * 
 * PostgreSQL adapter using pg library.
 * Implements unified database interface.
 * 
 * Install: npm install pg
 */

const { Pool } = require('pg');

class PostgresAdapter {
  constructor() {
    this.pool = null;
    this.users = new PostgresUserRepository(this);
    this.workoutLogs = new PostgresWorkoutRepository(this);
    this.nutritionLogs = new PostgresNutritionRepository(this);
  }

  async connect() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'baseline',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
      min: parseInt(process.env.POSTGRES_POOL_MIN) || 2,
      max: parseInt(process.env.POSTGRES_POOL_MAX) || 10
    });

    await this.pool.query('SELECT NOW()'); // Test connection
    await this.initializeTables();
  }

  async disconnect() {
    if (this.pool) await this.pool.end();
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  /**
   * Initialize database tables
   */
  async initializeTables() {
    try {
      // Users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          weight DECIMAL(5,2),
          age INT,
          height_ft INT,
          height_in INT,
          gender VARCHAR(50),
          goals JSONB DEFAULT '[]',
          frequency VARCHAR(50),
          equipment JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Workout logs table
      await this.query(`
        CREATE TABLE IF NOT EXISTS workout_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          day VARCHAR(20),
          date DATE DEFAULT CURRENT_DATE,
          duration INT,
          activity TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_workout_user_date ON workout_logs(user_id, date);
      `);

      // Nutrition logs table
      await this.query(`
        CREATE TABLE IF NOT EXISTS nutrition_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          day VARCHAR(20),
          date DATE DEFAULT CURRENT_DATE,
          breakfast TEXT,
          lunch TEXT,
          snack TEXT,
          dinner TEXT,
          notes TEXT,
          calories_estimated INT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_logs(user_id, date);
      `);

      console.log('✅ PostgreSQL tables initialized');
    } catch (error) {
      console.error('❌ Table initialization failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// REPOSITORY CLASSES
// ============================================================================

class PostgresUserRepository {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async create(userData) {
    const { email, password_hash, name, weight, age, height_ft, height_in, gender, goals, frequency, equipment } = userData;
    const result = await this.adapter.query(
      `INSERT INTO users (email, password_hash, name, weight, age, height_ft, height_in, gender, goals, frequency, equipment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [email, password_hash, name, weight, age, height_ft, height_in, gender, JSON.stringify(goals || []), frequency, JSON.stringify(equipment || [])]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await this.adapter.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await this.adapter.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(userData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'goals' || key === 'equipment' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    const result = await this.adapter.query(query, values);
    return result.rows[0];
  }

  async findAll() {
    const result = await this.adapter.query('SELECT * FROM users');
    return result.rows;
  }
}

class PostgresWorkoutRepository {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async create(workoutData) {
    const { user_id, day, date, duration, activity, notes } = workoutData;
    const result = await this.adapter.query(
      `INSERT INTO workout_logs (user_id, day, date, duration, activity, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, day, date, duration, activity, notes]
    );
    return result.rows[0];
  }

  async findByUserAndDay(userId, day) {
    const result = await this.adapter.query(
      `SELECT * FROM workout_logs WHERE user_id = $1 AND day = $2`,
      [userId, day]
    );
    return result.rows[0];
  }

  async findByUserThisWeek(userId) {
    const result = await this.adapter.query(
      `SELECT * FROM workout_logs WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );
    return result.rows;
  }

  async update(id, workoutData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(workoutData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE workout_logs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    const result = await this.adapter.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    await this.adapter.query('DELETE FROM workout_logs WHERE id = $1', [id]);
  }

  async findAll() {
    const result = await this.adapter.query('SELECT * FROM workout_logs');
    return result.rows;
  }
}

class PostgresNutritionRepository {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async create(nutritionData) {
    const { user_id, day, date, breakfast, lunch, snack, dinner, notes, calories_estimated } = nutritionData;
    const result = await this.adapter.query(
      `INSERT INTO nutrition_logs (user_id, day, date, breakfast, lunch, snack, dinner, notes, calories_estimated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, day, date, breakfast, lunch, snack, dinner, notes, calories_estimated]
    );
    return result.rows[0];
  }

  async findByUserAndDay(userId, day) {
    const result = await this.adapter.query(
      `SELECT * FROM nutrition_logs WHERE user_id = $1 AND day = $2`,
      [userId, day]
    );
    return result.rows[0];
  }

  async findByUserThisWeek(userId) {
    const result = await this.adapter.query(
      `SELECT * FROM nutrition_logs WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );
    return result.rows;
  }

  async update(id, nutritionData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(nutritionData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE nutrition_logs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    const result = await this.adapter.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    await this.adapter.query('DELETE FROM nutrition_logs WHERE id = $1', [id]);
  }

  async findAll() {
    const result = await this.adapter.query('SELECT * FROM nutrition_logs');
    return result.rows;
  }
}

module.exports = PostgresAdapter;
