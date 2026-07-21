# API Testing Guide - cURL Examples

Test all Personal Trainer Hub API endpoints using cURL commands.

## Prerequisites

- Backend running: `npm run dev` at http://localhost:3000
- User ID for testing: `test-user-123` (can be any string)
- cURL installed (built-in on macOS/Linux, or WSL on Windows)

## Quick Test

Test server is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","database":"postgresql"}
```

---

## User Profile Endpoints

### Create/Update User Profile

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
    "height_in": 10,
    "gender": "male",
    "goals": ["Build Muscle", "Lose Fat"],
    "frequency": "5 days per week",
    "equipment": ["Dumbbell", "Barbell"]
  }'
```

Expected response:
```json
{
  "id": "uuid...",
  "email": "user@example.com",
  "name": "John Doe",
  "weight": 180,
  "age": 25,
  "height_ft": 5,
  "height_in": 10,
  "gender": "male",
  "goals": ["Build Muscle", "Lose Fat"],
  "frequency": "5 days per week",
  "equipment": ["Dumbbell", "Barbell"],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### Get User Profile

```bash
curl http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user-123"
```

Expected response:
```json
{
  "id": "uuid...",
  "email": "user@example.com",
  "name": "John Doe",
  "weight": 180,
  "age": 25,
  ...
}
```

---

## Workout Log Endpoints

### Log a Workout

```bash
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 90,
    "activity": "Chest and Triceps",
    "notes": "Bench press: 185 lbs x 8, Incline press, Cable flies"
  }'
```

Expected response:
```json
{
  "id": "uuid...",
  "user_id": "test-user-123",
  "day": "Monday",
  "date": "2024-01-08T15:30:00Z",
  "duration": 90,
  "activity": "Chest and Triceps",
  "notes": "Bench press: 185 lbs x 8, Incline press, Cable flies",
  "created_at": "2024-01-08T15:30:00Z"
}
```

### Log Multiple Workouts

Monday:
```bash
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"duration": 90, "activity": "Chest and Triceps", "notes": "Bench press"}'
```

Wednesday:
```bash
curl -X POST http://localhost:3000/api/logs/workout/Wednesday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"duration": 75, "activity": "Back and Biceps", "notes": "Deadlifts 225x5"}'
```

Friday:
```bash
curl -X POST http://localhost:3000/api/logs/workout/Friday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "activity": "Legs", "notes": "Squats 275x6"}'
```

---

## Nutrition Log Endpoints

### Log Nutrition

```bash
curl -X POST http://localhost:3000/api/logs/nutrition/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "breakfast": "Oatmeal with banana and peanut butter",
    "lunch": "Chicken breast with rice and broccoli",
    "snack": "Greek yogurt with almonds",
    "dinner": "Salmon with sweet potato and asparagus",
    "notes": "High protein day",
    "calories_estimated": 2500
  }'
```

Expected response:
```json
{
  "id": "uuid...",
  "user_id": "test-user-123",
  "day": "Monday",
  "date": "2024-01-08T15:30:00Z",
  "breakfast": "Oatmeal with banana and peanut butter",
  "lunch": "Chicken breast with rice and broccoli",
  "snack": "Greek yogurt with almonds",
  "dinner": "Salmon with sweet potato and asparagus",
  "notes": "High protein day",
  "calories_estimated": 2500,
  "created_at": "2024-01-08T15:30:00Z"
}
```

### Log Multiple Nutrition Days

```bash
# Tuesday
curl -X POST http://localhost:3000/api/logs/nutrition/Tuesday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "breakfast": "Eggs and toast",
    "lunch": "Turkey sandwich",
    "dinner": "Lean beef with vegetables",
    "calories_estimated": 2200
  }'

# Thursday
curl -X POST http://localhost:3000/api/logs/nutrition/Thursday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "breakfast": "Protein smoothie",
    "lunch": "Tuna salad",
    "dinner": "Chicken with quinoa",
    "calories_estimated": 2100
  }'
```

---

## Get All Logs

### Fetch All Logs (This Week)

```bash
curl http://localhost:3000/api/logs \
  -H "x-user-id: test-user-123"
```

Expected response:
```json
{
  "workouts": [
    {
      "id": "uuid...",
      "user_id": "test-user-123",
      "day": "Monday",
      "duration": 90,
      "activity": "Chest and Triceps",
      ...
    },
    {
      "id": "uuid...",
      "day": "Wednesday",
      "duration": 75,
      ...
    }
  ],
  "nutrition": [
    {
      "id": "uuid...",
      "user_id": "test-user-123",
      "day": "Monday",
      "breakfast": "Oatmeal...",
      ...
    }
  ]
}
```

---

## Analytics Endpoints

### Get Analytics

```bash
curl http://localhost:3000/api/analytics \
  -H "x-user-id: test-user-123"
```

Expected response:
```json
{
  "profile": { ... },
  "logs": { ... },
  "message": "Use AnalyticsEngine.compute() on frontend"
}
```

### Get Recommendations

```bash
curl http://localhost:3000/api/recommendations \
  -H "x-user-id: test-user-123"
```

Expected response:
```json
{
  "message": "Use RecommendationEngine.generate() on frontend",
  "profile": { ... },
  "logsCount": {
    "workouts": 3,
    "nutrition": 2
  }
}
```

### Get Community Insights

```bash
curl http://localhost:3000/api/community/insights \
  -H "x-user-id: test-user-123"
```

Expected response:
```json
{
  "totalUsers": 1,
  "avgWorkoutsPerWeek": 3,
  "yourStats": { },
  "leaderboard": []
}
```

---

## Testing Workflow

### Complete Test Sequence

Run these in order to test the full workflow:

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Create user profile
curl -X POST http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "weight": 180,
    "age": 25
  }'

# 3. Get profile (should return same data)
curl http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user-123"

# 4. Log workouts
curl -X POST http://localhost:3000/api/logs/workout/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "activity": "Running"}'

curl -X POST http://localhost:3000/api/logs/workout/Wednesday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"duration": 75, "activity": "Lifting"}'

# 5. Log nutrition
curl -X POST http://localhost:3000/api/logs/nutrition/Monday \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"breakfast": "Oats", "lunch": "Chicken", "dinner": "Fish", "calories_estimated": 2200}'

# 6. Get all logs
curl http://localhost:3000/api/logs \
  -H "x-user-id: test-user-123"

# 7. Get analytics (should show aggregated data)
curl http://localhost:3000/api/analytics \
  -H "x-user-id: test-user-123"
```

---

## Error Scenarios

### Missing x-user-id Header

```bash
curl http://localhost:3000/api/users/profile
# Response: 401 Unauthorized
```

### Invalid JSON

```bash
curl -X POST http://localhost:3000/api/users/profile \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d 'invalid json'
# Response: 400 Bad Request
```

### Server Not Running

```bash
curl http://localhost:3000/health
# Response: curl: (7) Failed to connect
# Solution: Run npm run dev in backend folder
```

### Database Not Connected

```bash
npm run dev
# Message: ❌ PostgreSQL connection failed
# Solution: Start PostgreSQL service
```

---

## Tips for Testing

### Pretty Print JSON

```bash
# macOS/Linux (requires jq)
curl http://localhost:3000/api/logs \
  -H "x-user-id: test-user" | jq .

# Windows (PowerShell)
curl http://localhost:3000/api/logs `
  -H "x-user-id: test-user" | ConvertFrom-Json | ConvertTo-Json
```

### Save Response to File

```bash
curl http://localhost:3000/api/logs \
  -H "x-user-id: test-user" > logs.json

cat logs.json
```

### Verbose Output (see request/response details)

```bash
curl -v http://localhost:3000/api/logs \
  -H "x-user-id: test-user"
```

### Include Response Headers

```bash
curl -i http://localhost:3000/api/logs \
  -H "x-user-id: test-user"
```

### Time the Request

```bash
curl -w "\nTotal time: %{time_total}s\n" \
  http://localhost:3000/api/logs \
  -H "x-user-id: test-user"
```

---

## Using Postman Instead of cURL

### Import These Requests into Postman

1. **Health Check**
   - Method: GET
   - URL: http://localhost:3000/health

2. **Create User**
   - Method: POST
   - URL: http://localhost:3000/api/users/profile
   - Headers: x-user-id: test-user
   - Body (JSON):
     ```json
     {"name": "John", "weight": 180}
     ```

3. **Get User**
   - Method: GET
   - URL: http://localhost:3000/api/users/profile
   - Headers: x-user-id: test-user

4. **Log Workout**
   - Method: POST
   - URL: http://localhost:3000/api/logs/workout/Monday
   - Headers: x-user-id: test-user
   - Body (JSON):
     ```json
     {"duration": 60, "activity": "Running"}
     ```

5. **Get All Logs**
   - Method: GET
   - URL: http://localhost:3000/api/logs
   - Headers: x-user-id: test-user

---

## Success Criteria

✅ All endpoints return 200 or 201 status code
✅ Response includes all expected fields
✅ Data persists (can fetch after creating)
✅ Multiple users can coexist (different x-user-id)
✅ Invalid requests return appropriate error codes
✅ Database contains your data (verify with psql/mongosh)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| curl: command not found | Windows: Use WSL or PowerShell curl alias |
| Connection refused | Backend not running (npm run dev) |
| 401 Unauthorized | Missing or invalid x-user-id header |
| 500 Server Error | Check server logs for database connection error |
| Empty response | Backend might have crashed, check terminal |

---

**Ready to test!** Start with `curl http://localhost:3000/health` 🚀
