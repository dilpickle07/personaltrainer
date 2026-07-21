# Backend Integration Checklist

Use this checklist to track your backend setup progress.

## ✅ Pre-Setup

- [ ] Choose database type (PostgreSQL / MongoDB / Both)
- [ ] Read README.md for overview
- [ ] Read SETUP.md for detailed instructions
- [ ] Have Node.js installed (`node --version` shows 14+)
- [ ] Have npm installed (`npm --version`)

## ✅ Phase 1: Database Installation

### PostgreSQL
- [ ] Install PostgreSQL (brew / apt / Windows installer / Docker)
- [ ] Verify install (`psql --version` or `psql -U postgres -c "SELECT 1;"`)
- [ ] Create database: `createdb personaltrainer`
- [ ] Note: connection string in .env

### MongoDB
- [ ] Install MongoDB (brew / apt / Docker / Atlas cloud)
- [ ] Verify install (`mongosh` connects successfully)
- [ ] Note: connection string in .env

## ✅ Phase 2: Backend Setup

- [ ] Navigate to backend folder: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy config: `cp .env.example .env`
- [ ] Edit `.env` with your database credentials
- [ ] Verify `.env` has correct DATABASE_TYPE setting
- [ ] Start server: `npm run dev`
- [ ] See message "🚀 Server running at http://localhost:3000"

## ✅ Phase 3: Test Backend Endpoints

### Health Check
- [ ] Test: `curl http://localhost:3000/health`
- [ ] Response: `{"status":"ok","database":"postgresql"}`

### Create User Profile
- [ ] Test endpoint: POST /api/users/profile
- [ ] Include header: `x-user-id: test-user-123`
- [ ] Send JSON body with name, weight, age
- [ ] Response: User object with all fields

### Get User Profile
- [ ] Test endpoint: GET /api/users/profile
- [ ] Include header: `x-user-id: test-user-123`
- [ ] Response: Same user object

### Log Workout
- [ ] Test endpoint: POST /api/logs/workout/Monday
- [ ] Include header: `x-user-id: test-user-123`
- [ ] Send JSON with duration, activity
- [ ] Response: Workout object saved

### Get All Logs
- [ ] Test endpoint: GET /api/logs
- [ ] Include header: `x-user-id: test-user-123`
- [ ] Response: Array of workouts and nutrition logs

## ✅ Phase 4: Connect Frontend to Backend

### Update DataService
- [ ] Open `frontend/services/DataService.js`
- [ ] Find lines with `BASE_URL` and `USE_LOCAL_STORAGE`
- [ ] Change `BASE_URL = null` → `BASE_URL = 'http://localhost:3000'`
- [ ] Change `USE_LOCAL_STORAGE = true` → `USE_LOCAL_STORAGE = false`
- [ ] Save file (no other changes needed!)

### Test Frontend Integration
- [ ] Open frontend app: http://localhost:5173
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Fill out profile form and save
- [ ] See POST request to `/api/users/profile` in Network tab
- [ ] Verify status is 200 (success)
- [ ] Refresh page
- [ ] Profile data should reload from backend
- [ ] Console test:
  ```javascript
  const profile = await DataService.getUserProfile();
  console.log(profile);  // Should show backend data
  ```

## ✅ Phase 5: Test Complete Workflow

### Create User & Log Data
- [ ] Open frontend app
- [ ] Complete profile setup (onboarding)
- [ ] Click "Daily Logs" tab
- [ ] Log a workout for Monday
- [ ] Log nutrition for Monday
- [ ] Log workouts for 3+ days (for analytics)
- [ ] Click "Weekly Review" tab
- [ ] See stats populated (e.g., "3 workouts this week")

### Verify Backend Storage
- [ ] In terminal, query database directly:
  - PostgreSQL: `psql personaltrainer -c "SELECT * FROM users;"`
  - MongoDB: `mongosh → use personaltrainer → db.users.find()`
- [ ] See your user in database
- [ ] See your workout logs in database

## ✅ Optional: Advanced Features

### Database Selection
- [ ] Edit `.env`: `DATABASE_TYPE=postgresql` or `mongodb` or `both`
- [ ] Restart server: `npm run dev`
- [ ] Verify message shows correct database

### Multi-Database Sync
- [ ] Set `DATABASE_TYPE=both` in `.env`
- [ ] Set `PRIMARY_DB=postgresql`
- [ ] Add configs for both databases
- [ ] Restart server
- [ ] Should see both PostgreSQL and MongoDB connecting
- [ ] Data syncs between databases automatically

### Postman Testing
- [ ] Download Postman from https://www.postman.com/downloads/
- [ ] Create new collection "Personal Trainer API"
- [ ] Add requests for each endpoint:
  - `GET /health`
  - `POST /api/users/profile`
  - `GET /api/users/profile`
  - `POST /api/logs/workout/{day}`
  - `GET /api/logs`
- [ ] For each request, set header: `x-user-id: test-user`
- [ ] Test each request (should all pass)

### Database Monitoring
- [ ] PostgreSQL: `psql personaltrainer -c "SELECT datname, numbackends FROM pg_stat_database;"`
- [ ] MongoDB: `mongosh → db.serverStatus()`
- [ ] Verify databases are connected

## 🐛 Troubleshooting Checklist

If things aren't working, check these:

### Can't Start Server
- [ ] Node.js installed? `node --version`
- [ ] npm installed? `npm --version`
- [ ] Dependencies installed? `npm install` in backend/
- [ ] .env file created? `ls .env` or `dir .env`
- [ ] DATABASE_TYPE set correctly in .env?
- [ ] Port 3000 free? `lsof -i :3000` (macOS/Linux)

### Backend Endpoints Fail
- [ ] Server running? See "🚀 Server running at..."
- [ ] Using correct URL? http://localhost:3000 (not 3001, etc)
- [ ] Including x-user-id header?
- [ ] Using correct HTTP method? (GET vs POST)
- [ ] Using correct JSON format in body?
- [ ] Check browser DevTools Network tab for full error

### Database Connection Fails
- [ ] Database running?
  - PostgreSQL: `psql -U postgres -c "SELECT 1;"`
  - MongoDB: `mongosh`
- [ ] Correct credentials in .env?
  - POSTGRES_USER, POSTGRES_PASSWORD, etc
  - MONGO_URI format correct?
- [ ] Port correct?
  - PostgreSQL default: 5432
  - MongoDB default: 27017
- [ ] Database exists?
  - PostgreSQL: `psql -l | grep personaltrainer`
  - MongoDB: `mongosh → show databases`

### Frontend Can't Connect
- [ ] Backend running? `curl http://localhost:3000/health`
- [ ] DataService.js updated correctly?
  - BASE_URL set to 'http://localhost:3000'?
  - USE_LOCAL_STORAGE set to false?
- [ ] Browser cache cleared? (Ctrl+Shift+R)
- [ ] Check DevTools Network tab for CORS errors
- [ ] FRONTEND_URL set correctly in backend .env?

## 📊 Success Indicators

- [ ] `npm run dev` shows "Server running at http://localhost:3000"
- [ ] `curl http://localhost:3000/health` returns {"status":"ok",...}
- [ ] Frontend form saves successfully
- [ ] DevTools shows POST to backend (not just localStorage)
- [ ] Profile reloads after refresh (from backend, not localStorage)
- [ ] Database query shows your data stored

## 🎯 Next Steps After Successful Setup

1. **Add authentication** (JWT tokens, login)
2. **Add input validation** (check email format, weight > 0, etc)
3. **Improve error handling** (friendly error messages)
4. **Add logging** (track all requests)
5. **Test with real data** (log 2+ weeks of workouts)
6. **Deploy to production** (Heroku, Railway, AWS)

## 🔗 Reference Documents

- `README.md` - Overview & architecture
- `SETUP.md` - Detailed setup instructions
- `IMPLEMENTATION_GUIDE.md` - Step-by-step walkthrough
- `API_CONTRACT.md` - API endpoint specifications
- `ANALYTICS_GUIDE.md` - Analytics system integration

## 💾 Quick Commands

```bash
# Start backend
npm run dev

# Test health
curl http://localhost:3000/health

# Query PostgreSQL
psql personaltrainer -c "SELECT * FROM users;"

# Query MongoDB
mongosh personaltrainer -c "db.users.find()"

# Install dependencies
npm install

# Check Node version
node --version

# Change database type
# Edit .env: DATABASE_TYPE=mongodb
# Restart: npm run dev
```

## 📞 Getting Help

- **Setup issues?** See SETUP.md Phase 1-2
- **Connection errors?** Check .env credentials
- **API not working?** Test with curl first, then browser
- **Frontend not connecting?** Check DataService.js BASE_URL
- **Database errors?** Verify database is running and accessible

---

**Status:** Ready to begin setup! Follow the phases in IMPLEMENTATION_GUIDE.md 🚀
