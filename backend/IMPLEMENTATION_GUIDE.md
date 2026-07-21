# Backend Implementation Guide

Complete step-by-step guide to get your Personal Trainer Hub backend running with PostgreSQL, MongoDB, or both!

## Phase 1: Environment Setup (5 minutes)

### 1.1 Choose Your Database

**Option A: PostgreSQL (Recommended - start here)**
- Best for: Traditional relational data, ACID guarantees, complex queries
- Complexity: Low
- Cost: Free
- Scalability: Vertical (mostly)

**Option B: MongoDB (Recommended if you want flexibility)**
- Best for: Flexible schemas, rapid development, document storage
- Complexity: Low-Medium
- Cost: Free (Atlas cloud option available)
- Scalability: Horizontal (sharding)

**Option C: Both Databases (Advanced - for scalability)**
- Best for: Polyglot persistence, different data types in different DBs
- Complexity: Medium
- Cost: Free
- Scalability: Excellent

### 1.2 Install Database

**PostgreSQL on macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**PostgreSQL on Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**PostgreSQL on Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, choose password, install pgAdmin

**PostgreSQL via Docker (any OS):**
```bash
docker run -d \
  --name personaltrainer-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=personaltrainer \
  -p 5432:5432 \
  postgres:15
```

**MongoDB on macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**MongoDB on Linux (Ubuntu):**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**MongoDB via Docker (any OS):**
```bash
docker run -d \
  --name personaltrainer-mongo \
  -e MONGO_INITDB_DATABASE=personaltrainer \
  -p 27017:27017 \
  mongo:6.0
```

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster
4. Get connection string
5. Save as MONGO_URI in .env

### 1.3 Verify Database Installation

**PostgreSQL:**
```bash
psql -U postgres -c "SELECT 1;"
# Should show: 
# ?column?
#----------
#        1
```

**MongoDB:**
```bash
mongosh
# Should show: Current Mongosh version: X.X.X
# Type exit to quit
exit
```

## Phase 2: Backend Setup (5 minutes)

### 2.1 Install Node Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `cors` - Enable cross-origin requests
- `pg` - PostgreSQL driver
- `mongoose` - MongoDB driver
- `dotenv` - Environment variables

### 2.2 Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:

**For PostgreSQL:**
```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=personaltrainer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_SSL=false
POSTGRES_POOL_MIN=2
POSTGRES_POOL_MAX=10

NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**For MongoDB:**
```env
DATABASE_TYPE=mongodb
MONGO_URI=mongodb://localhost:27017/personaltrainer

NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**For Both:**
```env
DATABASE_TYPE=both
PRIMARY_DB=postgresql

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=personaltrainer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_SSL=false
POSTGRES_POOL_MIN=2
POSTGRES_POOL_MAX=10

# MongoDB
MONGO_URI=mongodb://localhost:27017/personaltrainer

NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 2.3 Start Backend Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
🚀 Server running at http://localhost:3000
📊 Database Type: postgresql
🔗 Frontend URL: http://localhost:5173
```

## Phase 3: Test Backend (5 minutes)

### 3.1 Test Health Endpoint

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","database":"postgresql"}
```

### 3.2 Test User Endpoints

Create a test user:
```bash
curl -X POST http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "weight": 180,
    "age": 25,
    "height_ft": 5,
    "height_in": 10
  }'
```

Fetch user:
```bash
curl http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user-123"
```

### 3.3 Test Workout Logging

```bash
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 60,
    "activity": "Running",
    "notes": "5K run in 32 minutes"
  }'
```

### 3.4 Use Postman (Optional but Recommended)

1. Download Postman from https://www.postman.com/downloads/
2. Import example requests (see examples below)
3. Test endpoints with UI instead of curl

**Postman Example - Create User:**
```
Method: POST
URL: http://localhost:3000/api/users/profile
Headers:
  x-user-id: test-user-123
  Content-Type: application/json
Body (JSON):
{
  "email": "user@example.com",
  "name": "John Doe",
  "weight": 180,
  "age": 25
}
```

## Phase 4: Connect Frontend to Backend (5 minutes)

### 4.1 Update DataService

Edit `frontend/services/DataService.js`:

**BEFORE (localStorage):**
```javascript
class DataService {
  static BASE_URL = null;  // null = localStorage mode
  static USE_LOCAL_STORAGE = true;
  // ... rest of code
}
```

**AFTER (Backend API):**
```javascript
class DataService {
  static BASE_URL = 'http://localhost:3000';  // Your backend URL
  static USE_LOCAL_STORAGE = false;           // Use API instead
  // ... rest of code unchanged!
}
```

### 4.2 Test Frontend Integration

1. Open frontend app in browser: http://localhost:5173
2. Open browser DevTools (F12)
3. Go to Network tab
4. Fill out profile form and save
5. You should see POST request to `http://localhost:3000/api/users/profile`
6. Check response in Network tab
7. Open Console and run:

```javascript
// Check if data was saved to backend
const profile = await DataService.getUserProfile();
console.log(profile);  // Should show your profile data
```

## Phase 5: Create Test Data (Optional)

### 5.1 Add Sample User Profile

```bash
# Create user
curl -X POST http://localhost:3000/api/users/profile \
  -H "x-user-id: demo-user" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "name": "Demo User",
    "weight": 175,
    "age": 30,
    "height_ft": 6,
    "height_in": 0,
    "gender": "male",
    "goals": ["Build Muscle", "Lose Fat"],
    "frequency": "5 days per week",
    "equipment": ["Dumbbell", "Barbell"]
  }'
```

### 5.2 Add Sample Workouts

```bash
# Monday workout
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: demo-user" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 90,
    "activity": "Chest and Triceps",
    "notes": "Bench press: 185 lbs x 8, Incline press, Cable flies"
  }'

# Wednesday workout
curl -X POST http://localhost:3000/api/logs/workout/Wednesday \
  -H "x-user-id: demo-user" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 75,
    "activity": "Back and Biceps",
    "notes": "Deadlifts: 225 lbs x 5, Rows, Pullups"
  }'

# Friday workout
curl -X POST http://localhost:3000/api/logs/workout/Friday \
  -H "x-user-id: demo-user" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 60,
    "activity": "Legs",
    "notes": "Squats: 275 lbs x 6, Leg press, Extensions"
  }'
```

### 5.3 Add Sample Nutrition

```bash
# Monday nutrition
curl -X POST http://localhost:3000/api/logs/nutrition/Monday \
  -H "x-user-id: demo-user" \
  -H "Content-Type: application/json" \
  -d '{
    "breakfast": "Oatmeal with banana and peanut butter",
    "lunch": "Chicken breast with rice and broccoli",
    "snack": "Greek yogurt with almonds",
    "dinner": "Salmon with sweet potato and asparagus",
    "calories_estimated": 2500
  }'
```

### 5.4 View All Logs

```bash
curl http://localhost:3000/api/logs \
  -H "x-user-id: demo-user"
```

## Phase 6: Advanced - Multi-Database Setup (Optional)

### 6.1 Run Both PostgreSQL and MongoDB

Update `.env`:
```env
DATABASE_TYPE=both
PRIMARY_DB=postgresql
# ... add all configs for both databases
```

Restart backend:
```bash
npm run dev
```

### 6.2 Sync Data Between Databases

```javascript
// In Node.js console or backend code
const DatabaseFactory = require('./src/database/DatabaseFactory');
await DatabaseFactory.initialize();
await DatabaseFactory.syncBetweenDatabases('postgresql', 'mongodb');
console.log('✅ Synced!');
```

### 6.3 Query from Specific Database

```javascript
// Get from PostgreSQL
const pgWorkouts = await DatabaseFactory.getAdapter('postgresql').workoutLogs.findAll();

// Get from MongoDB  
const mongoWorkouts = await DatabaseFactory.getAdapter('mongodb').workoutLogs.findAll();
```

## Troubleshooting

### Problem: "ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not running

**Fix:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Docker
docker start personaltrainer-postgres
```

### Problem: "Cannot find module 'pg' or 'mongoose'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd backend
npm install
```

### Problem: "MONGO_ERR: connect ECONNREFUSED"

**Cause:** MongoDB not running

**Fix:**
```bash
# macOS
brew services start mongodb-community@6.0

# Linux
sudo systemctl start mongod

# Docker
docker start personaltrainer-mongo
```

### Problem: "Port 3000 already in use"

**Cause:** Another app using port 3000

**Fix:**
```bash
# Change port in .env
PORT=3001

# Or kill the process (macOS/Linux)
lsof -i :3000
kill -9 <PID>

# Or kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problem: "CORS error when frontend calls backend"

**Cause:** CORS not configured properly

**Fix:** In `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

If frontend is on different port/host, update accordingly.

### Problem: "Frontend still using localStorage"

**Cause:** DataService.js still has OLD values

**Fix:** In `frontend/services/DataService.js`:
```javascript
// This must be changed:
static BASE_URL = 'http://localhost:3000';  // ← your backend URL
static USE_LOCAL_STORAGE = false;           // ← must be false
```

Then refresh browser (Ctrl+Shift+R to clear cache).

## Next Steps

### After Basic Setup Works

1. **Test all endpoints** with curl/Postman
2. **Verify frontend integration** (check Network tab)
3. **Add more test data** (at least 5+ workouts)
4. **Check analytics** (backend can compute from data)

### For Production

1. **Add authentication** (JWT implementation)
2. **Add input validation** (check all API params)
3. **Add error handling** (try/catch blocks)
4. **Setup logging** (track requests)
5. **Deploy to cloud** (Heroku, Railway, AWS)

### For Scaling

1. **Use database replicas** (for reads)
2. **Add caching** (Redis)
3. **Use message queue** (for async tasks)
4. **Monitor performance** (APM tool)

## Architecture Overview

```
User Browser
    ↓
Frontend App (HTML/CSS/JS)
    ↓
DataService (API abstraction)
    ↓
Express.js Server (REST API)
    ↓
DatabaseFactory (DB abstraction)
    ↓
┌─────────────────────────────┐
│                             │
│  PostgreSQL  ←→  MongoDB    │
│  (relational)   (documents) │
│                             │
└─────────────────────────────┘
```

## Command Reference

```bash
# Installation
npm install                    # Install dependencies
cp .env.example .env          # Create config

# Running
npm run dev                   # Development (auto-reload)
npm start                     # Production
npm test                      # Run tests

# Database
npm run migrate:postgres      # Import data to PostgreSQL
npm run migrate:mongo         # Import data to MongoDB
npm run sync                  # Sync between databases
npm run seed                  # Generate test data

# Maintenance
npm run health-check          # Check database status
npm run clean-db              # Clear all data (careful!)
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/server.js` | Express app + routes |
| `src/database/DatabaseFactory.js` | Database selection |
| `src/database/adapters/PostgresAdapter.js` | PostgreSQL driver |
| `src/database/adapters/MongoAdapter.js` | MongoDB driver |
| `.env.example` | Configuration template |
| `.env` | Your actual config (don't commit!) |
| `package.json` | Dependencies + scripts |

## Testing Your API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Create user
curl -X POST http://localhost:3000/api/users/profile \
  -H "x-user-id: test" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "weight": 180}'

# Get user
curl http://localhost:3000/api/users/profile \
  -H "x-user-id: test"

# Log workout
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: test" \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "activity": "Running"}'
```

### Using Postman

1. Import example requests (see above)
2. Set `x-user-id` header on each request
3. Click Send
4. View response in Response panel

---

**You're ready!** Follow phases 1-4 and your backend is live! 🚀
