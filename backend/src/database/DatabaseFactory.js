/**
 * backend/src/database/DatabaseFactory.js
 * 
 * Factory pattern for database abstraction.
 * Supports PostgreSQL, MongoDB, or both.
 * Automatically instantiates the right drivers based on env config.
 * 
 * Usage:
 *   const db = DatabaseFactory.getInstance();
 *   const user = await db.users.findById(userId);
 *   
 * All database operations go through this unified interface!
 */

const PostgresAdapter = require('./adapters/PostgresAdapter');
const MongoAdapter = require('./adapters/MongoAdapter');

class DatabaseFactory {
  static instance = null;
  static adapters = {
    postgres: null,
    mongo: null
  };

  /**
   * Initialize database connections based on DATABASE_TYPE env var
   */
  static async initialize() {
    const dbType = process.env.DATABASE_TYPE || 'postgresql';
    console.log(`🗄️  Initializing database: ${dbType}`);

    try {
      if (dbType === 'postgresql' || dbType === 'both') {
        console.log('  → PostgreSQL');
        this.adapters.postgres = new PostgresAdapter();
        await this.adapters.postgres.connect();
      }

      if (dbType === 'mongodb' || dbType === 'both') {
        console.log('  → MongoDB');
        this.adapters.mongo = new MongoAdapter();
        await this.adapters.mongo.connect();
      }

      // Use the first available adapter as primary
      const primaryType = dbType === 'both' 
        ? (process.env.PRIMARY_DB || 'postgresql')
        : dbType;

      this.instance = this.adapters[primaryType === 'postgresql' ? 'postgres' : 'mongo'];
      
      if (!this.instance) {
        throw new Error(`No database adapter initialized for type: ${primaryType}`);
      }

      console.log('✅ Database(s) connected successfully\n');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get primary database instance
   */
  static getInstance() {
    if (!this.instance) {
      throw new Error('Database not initialized. Call DatabaseFactory.initialize() first.');
    }
    return this.instance;
  }

  /**
   * Get specific adapter (for multi-database scenarios)
   */
  static getAdapter(type) {
    if (type === 'postgresql') return this.adapters.postgres;
    if (type === 'mongodb') return this.adapters.mongo;
    return null;
  }

  /**
   * Sync data between databases (for migration)
   */
  static async syncBetweenDatabases(fromType, toType) {
    const from = this.getAdapter(fromType);
    const to = this.getAdapter(toType);

    if (!from || !to) {
      throw new Error('One or both database adapters not initialized');
    }

    console.log(`📊 Syncing ${fromType} → ${toType}`);

    try {
      // Sync users
      const users = await from.users.findAll();
      for (const user of users) {
        await to.users.create(user);
      }

      // Sync workout logs
      const workouts = await from.workoutLogs.findAll();
      for (const workout of workouts) {
        await to.workoutLogs.create(workout);
      }

      // Sync nutrition logs
      const nutrition = await from.nutritionLogs.findAll();
      for (const entry of nutrition) {
        await to.nutritionLogs.create(entry);
      }

      console.log('✅ Sync complete');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect all databases
   */
  static async disconnect() {
    if (this.adapters.postgres) {
      await this.adapters.postgres.disconnect();
    }
    if (this.adapters.mongo) {
      await this.adapters.mongo.disconnect();
    }
  }
}

module.exports = DatabaseFactory;
