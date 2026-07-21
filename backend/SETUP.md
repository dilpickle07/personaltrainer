# Backend Setup Guide - Multi-Database Support

Your backend supports **PostgreSQL**, **MongoDB**, or **both** simultaneously!

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Choose Your Database

Edit `.env`:

**PostgreSQL only:**
```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=personaltrainer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

**MongoDB only:**
```env
DATABASE_TYPE=mongodb
MONGO_URI=mongodb://localhost:27017/personaltrainer
```

**Both (polyglot):**
```env
DATABASE_TYPE=both
PRIMARY_DB=postgresql
# ... add both Postgres and Mongo configs
```

### 4. Start Server

```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

Server runs on `http://localhost:3000`

---

## Database Setup

### PostgreSQL

#### Option A: Local Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Install and create database
psql -U postgres -c "CREATE DATABASE personaltrainer;"
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb personaltrainer
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb personaltrainer
```

#### Option B: Docker

```bash
docker run --name personaltrainer-postgres \
  -e POSTGRES_DB=personaltrainer \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

#### Verify Connection

```bash
psql -U postgres -d personaltrainer -c "SELECT 1;"
```

### MongoDB

#### Option A: Local Installation

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Install and MongoDB automatically starts

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option B: Docker

```bash
docker run --name personaltrainer-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=personaltrainer \
  -d mongo:6.0
```

#### Option C: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. In `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/personaltrainer
```

#### Verify Connection

```bash
mongosh  # Or: mongo
use personaltrainer
db.users.findOne()
```

---

## Architecture

### Single Database Mode

```
Frontend (React)
    ↓
DataService (API mode)
    ↓
Express.js Server
    ↓
[PostgreSQL] OR [MongoDB]
```

### Dual Database Mode (Polyglot)

```
Frontend (React)
    ↓
DataService (API mode)
    ↓
Express.js Server
    ↓
├─ [PostgreSQL]
│  └─ Users, analytics, transactions
│
└─ [MongoDB]
   └─ Logs, flexible schemas, documents
```

**Benefits of both:**
- PostgreSQL: ACID transactions, complex queries
- MongoDB: Flexible schemas, document storage
- Real-time sync between databases

---

## API Endpoints

All endpoints require `x-user-id` header (in production, from JWT):

```javascript
// Example
fetch('/api/users/profile', {
  headers: { 'x-user-id': 'user-123' }
})
```

### User Profile

```
GET  /api/users/profile        - Get current user
POST /api/users/profile        - Update profile
```

### Logs

```
GET  /api/logs                 - Get all logs this week
POST /api/logs/workout/{day}   - Log a workout
POST /api/logs/nutrition/{day} - Log nutrition
```

### Analytics

```
GET  /api/analytics            - Get user analytics
GET  /api/recommendations      - Get recommendations
GET  /api/community/insights   - Get community benchmarks
```

### Health

```
GET  /health                   - Check server status
```

---

## Updating Frontend DataService

Once backend is running, update `frontend/services/DataService.js`:

```javascript
// BEFORE
static BASE_URL = null;
static USE_LOCAL_STORAGE = true;

// AFTER
static BASE_URL = 'http://localhost:3000';
static USE_LOCAL_STORAGE = false;
```

Now your frontend uses the backend API! 🚀

---

## Migration Scripts

### Migrate localStorage → PostgreSQL

```bash
npm run migrate:postgres
```

Exports data from frontend's localStorage and imports to PostgreSQL.

### Migrate localStorage → MongoDB

```bash
npm run migrate:mongo
```

### Sync Between Databases

If using both databases, keep them in sync:

```bash
npm run sync
```

Syncs PostgreSQL → MongoDB (or vice versa).

---

## Database Comparison

| Feature | PostgreSQL | MongoDB |
|---------|-----------|---------|
| **Schema** | Strict (SQL) | Flexible (JSON) |
| **Queries** | Complex SQL | Simple queries |
| **ACID** | Yes | Yes (4.0+) |
| **Scale** | Horizontal | Sharding |
| **Best for** | Structured data | Flexible data |
| **Cost** | Free | Free (Atlas paid) |

**Recommendation:**
- Start with **PostgreSQL** (most common)
- Add **MongoDB** if you need flexibility
- Use both for different data types

---

## Docker Compose (Easy Setup)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: personaltrainer
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6.0
    environment:
      MONGO_INITDB_DATABASE: personaltrainer
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_TYPE: both
      POSTGRES_HOST: postgres
      MONGO_URI: mongodb://mongodb:27017/personaltrainer
    depends_on:
      - postgres
      - mongodb

volumes:
  postgres_data:
  mongo_data:
```

Run everything:
```bash
docker-compose up
```

---

## Troubleshooting

### PostgreSQL Connection Error

```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Restart PostgreSQL service

### MongoDB Connection Error

```
error: failed to connect to server
```

**Solution:**
- Verify MongoDB is running: `mongosh`
- Check MONGO_URI format
- If using Atlas, whitelist your IP

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Can't Find Modules

```
Cannot find module 'pg' or 'mongoose'
```

**Solution:**
```bash
npm install
# or for specific DB
npm install pg      # PostgreSQL
npm install mongoose # MongoDB
```

---

## Scaling

### PostgreSQL Scaling

1. **Connection Pooling:**
   - Adjust `POSTGRES_POOL_MIN/MAX` in `.env`

2. **Read Replicas:**
   - Set up read replicas for queries
   - Write to primary, read from replicas

3. **Partitioning:**
   - Partition workout/nutrition logs by date

### MongoDB Scaling

1. **Sharding:**
   - Shard collection by `user_id`

2. **Indexing:**
   - Indexes already on user_id + date

3. **Replication:**
   - Use replica sets for high availability

---

## Advanced: Using Both Databases

### Example: Store different data in different DBs

```javascript
// In adapters, choose which DB for each operation:

// Users in PostgreSQL (ACID needed)
await db.users.create(userData);  // → PostgreSQL

// Logs in MongoDB (flexible, fast)
await db.workoutLogs.create(log); // → MongoDB

// Analytics computed from both
const result = await AnalyticsEngine.compute(pgUser, mongoLogs);
```

---

## Next Steps

1. ✅ Set up one database (PostgreSQL or MongoDB)
2. ✅ Start backend server
3. ✅ Update frontend DataService
4. ✅ Test endpoints with curl or Postman
5. ✅ Deploy to production (Heroku, Railway, etc.)

---

## Production Deployment

### Heroku

```bash
# Install Heroku CLI
heroku create personaltrainer-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway

```bash
# Install Railway CLI
railway link
railway up
```

### AWS/GCP/Azure

1. Create VM/App Service
2. Install Node.js
3. Set environment variables
4. `npm install && npm start`

---

## Monitoring

### Logs

```bash
# Development
npm run dev

# Production (with PM2)
npm install -g pm2
pm2 start src/server.js --name "personaltrainer"
pm2 logs
```

### Database Monitoring

**PostgreSQL:**
```sql
SELECT datname, numbackends FROM pg_stat_database WHERE datname='personaltrainer';
```

**MongoDB:**
```javascript
db.serverStatus()
```

---

## Questions?

- **Database choosing help?** Start with PostgreSQL (simpler)
- **Docker issues?** Ensure Docker Desktop is running
- **Deployment help?** See DEPLOYMENT.md
- **API issues?** Check browser DevTools Network tab

**You're all set!** 🚀
