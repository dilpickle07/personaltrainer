/**
 * backend/src/database/adapters/MongoAdapter.js
 * 
 * MongoDB adapter using mongoose.
 * Implements same interface as PostgresAdapter for seamless swapping.
 * 
 * Install: npm install mongoose
 */

const mongoose = require('mongoose');

class MongoAdapter {
  constructor() {
    this.connection = null;
    this.users = new MongoUserRepository();
    this.workoutLogs = new MongoWorkoutRepository();
    this.nutritionLogs = new MongoNutritionRepository();
    this.initializeSchemas();
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/baseline',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
    }
  }

  initializeSchemas() {
    // User schema
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true, required: true },
      password_hash: { type: String, required: true },
      name: { type: String, required: true },
      weight: Number,
      age: Number,
      height_ft: Number,
      height_in: Number,
      gender: String,
      goals: { type: [String], default: [] },
      frequency: String,
      equipment: { type: [String], default: [] },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });

    // Workout log schema
    const workoutSchema = new mongoose.Schema({
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      day: String,
      date: { type: Date, default: Date.now },
      duration: Number,
      activity: String,
      notes: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });

    // Nutrition log schema
    const nutritionSchema = new mongoose.Schema({
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      day: String,
      date: { type: Date, default: Date.now },
      breakfast: String,
      lunch: String,
      snack: String,
      dinner: String,
      notes: String,
      calories_estimated: Number,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });

    // Create indexes
    userSchema.index({ email: 1 });
    workoutSchema.index({ user_id: 1, date: 1 });
    nutritionSchema.index({ user_id: 1, date: 1 });

    // Store models globally
    this.UserModel = mongoose.model('User', userSchema);
    this.WorkoutModel = mongoose.model('Workout', workoutSchema);
    this.NutritionModel = mongoose.model('Nutrition', nutritionSchema);

    // Set repos to use models
    this.users.model = this.UserModel;
    this.workoutLogs.model = this.WorkoutModel;
    this.nutritionLogs.model = this.NutritionModel;
  }
}

// ============================================================================
// REPOSITORY CLASSES FOR MONGODB
// ============================================================================

class MongoUserRepository {
  constructor() {
    this.model = null;
  }

  async create(userData) {
    const user = new this.model(userData);
    return await user.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async update(id, userData) {
    return await this.model.findByIdAndUpdate(id, userData, { new: true });
  }

  async findAll() {
    return await this.model.find();
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

class MongoWorkoutRepository {
  constructor() {
    this.model = null;
  }

  async create(workoutData) {
    const workout = new this.model(workoutData);
    return await workout.save();
  }

  async findByUserAndDay(userId, day) {
    return await this.model.findOne({ user_id: userId, day });
  }

  async findByUserThisWeek(userId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.model.find({
      user_id: userId,
      date: { $gte: weekAgo }
    });
  }

  async update(id, workoutData) {
    return await this.model.findByIdAndUpdate(id, workoutData, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async findAll() {
    return await this.model.find();
  }
}

class MongoNutritionRepository {
  constructor() {
    this.model = null;
  }

  async create(nutritionData) {
    const nutrition = new this.model(nutritionData);
    return await nutrition.save();
  }

  async findByUserAndDay(userId, day) {
    return await this.model.findOne({ user_id: userId, day });
  }

  async findByUserThisWeek(userId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.model.find({
      user_id: userId,
      date: { $gte: weekAgo }
    });
  }

  async update(id, nutritionData) {
    return await this.model.findByIdAndUpdate(id, nutritionData, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async findAll() {
    return await this.model.find();
  }
}

module.exports = MongoAdapter;
