# Content Broadcasting System

Backend Developer – Technical Assignment | Stack: Node.js · MySQL · Redis · AWS S3

---

## What This Is

The task was to build a system where teachers can upload subject-wise content (images etc.), principal can approve/reject the uploads and students can access the live, approved content through public endpoints. No auth required on student side.

I have tried to keep it modular and clean. The core flow works end to end and I have added redis caching + s3 storage as optional layers that you can turn on/off via environment variables.
---

## Getting It Running

Easiest way is Docker — it handles MySQL and Redis for you:

```bash
git clone https://github.com/kishan817835/Content_Broadcasting_System-GRUBPAC.git   

cd Content_Broadcasting_System-GRUBPAC
docker-compose up -d mysql redis
npm install
cp .env.example .env   # fill in your DB creds
npm run dev
```

Server starts on `http://localhost:3000`

If you don't want Docker, just set up a local MySQL instance, update the `.env`, and run `npm run dev` directly.

---

## Folder Structure

I've split things into config, middlewares, models, routes, services and utils:

```
src/
├── app.js                   # Express app entry
├── config/
│   ├── database.js          # MySQL pool setup
│   ├── redis.js             # Redis (optional)
│   └── aws.js               # S3 (optional)
├── middlewares/
│   ├── auth.js              # JWT validation
│   ├── upload.js            # Multer + file validation
│   └── errorHandler.js      # Catches unhandled errors
├── models/                  # DB query functions
├── routes/                  # Auth, content, public, analytics
├── services/
│   └── SchedulingService.js # The rotation logic lives here
└── utils/
    └── responseHelper.js    # Consistent response format
```

---

## How Each User Interacts

### Principal

Login → check pending uploads → approve or reject with a reason.

```bash
POST /api/auth/login
GET  /api/content/pending
POST /api/content/approve/{id}
POST /api/content/reject/{id}    # body: { "rejection_reason": "..." }
```

### Teacher

Login → upload content with subject + optional time window → check status.

```bash
POST /api/auth/login
POST /api/content/upload          # multipart/form-data
GET  /api/content/my-content
```

### Student (Public, No Login)

Just hit the endpoint. No token needed.

```bash
GET /content/live/{teacherId}
GET /content/live/{teacherId}/{subject}
```

---

## Scheduling Logic

This was likely the toughest part of all. This is how it works:

Content is displayed only if it is `approved` and the current time is between `start_time` and `end_time`
- Subjects rotate every 30 minutes - so if a teacher is teaching Maths and Science, they rotate on a half hour cycle
- Single pieces of content in a subject rotate every 5 minutes
- If there is no time window, the content is always active once approved

The real calculation:

```javascript
// Which subject is active right now?
const subjectIndex = Math.floor(totalMinutes / 30) % subjects.length;

// Which content item within that subject?
const contentIndex = Math.floor(totalMinutes / 5) % contentList.length;
```

Server runs on UTC. If you're testing locally in IST, keep in mind that 11:30 AM IST = 6:00 AM UTC — so set your `start_time` accordingly.

---

## Auth & Permissions

JWT-based, tokens expire in 24 hours. Passwords are bcrypt-hashed (10 rounds).

Two roles: `principal` and `teacher`. They can't access each other's endpoints — middleware handles that. The student-facing endpoints have no auth at all.

```bash
POST /api/auth/register   # { name, email, password, role }
POST /api/auth/login      # returns token + user object
GET  /api/auth/profile    # requires Bearer token
```

---

## File Uploads

Multer. File formats: JPG, PNG, GIF. Maximum size: 10 MB.

By default files are saved locally. If you set `S3_ENABLED=true` and provide AWS credentials, they go to S3 instead.  When S3 goes down for whatever reason it automatically falls back to local storage and nothing breaks.

Filenames are based on timestamps to be unique and to avoid overwrites.

---

## Optional Features

Both Redis and S3 are off by default. You can enable them independently.

| Feature | Env Variable | Default | What it does |
|---|---|---|---|
| Redis Caching | `REDIS_ENABLED=true` | false | Caches `/content/live` responses for 60s |
| AWS S3 Storage | `S3_ENABLED=true` | false | Stores uploads in the cloud |

Deployment scenarios:

| Setup | Redis | S3 | Good for |
|---|---|---|---|
| Development | Off | Off | Local testing, no external deps |
| Staging | On | Off | Performance testing with cache |
| Production | On | On | Full scalability |

---

## Environment Variables

```bash
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=content_broadcasting
DB_USER=root
DB_PASSWORD=1234

JWT_SECRET=your-jwt-secret-key

UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Redis (optional)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# S3 (optional)
S3_ENABLED=false
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

---

## Full API Reference

### Analytics (Principal only)

```bash
GET /api/analytics/subjects          # Subject-wise usage stats
GET /api/analytics/teachers/{id}     # Teacher-specific performance
```

### Response Format

Success:
```json
{ "id": 1, "title": "Math Test", "subject": "Maths", "file_url": "...", "uploader_name": "John" }
```

No content matching the time window:
```json
{ "message": "No content available" }
```

Auth errors:
```json
{ "error": "Access token required" }
```

---

## Security & Performance

**Security**
- Parameterized queries everywhere – never raw string interpolation in SQL
- Password hashing : bcrypt, 10 rounds
- JWT tokens expire in 24 hours
- check file type + size before saving anything
- Rate limiting on public endpoints: 100 requests / 15 min
- Input validation with express-validator, CORS setup

**Performance**
- MySQL connection pool - don't open a new connection per request
- Redis cache of `/content/live` routes (60s TTL)
- Automatic approval/rejection of content cache invalidation
- Graceful degradation - if redis is down it just hits the DB directly

---

## Docker Commands

```bash
# Start only DB services
docker-compose up -d mysql redis

# Start everything
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Connect to MySQL inside container
docker exec -it content-broadcasting-mysql mysql -u root -p1234
```

---

## Assumptions & Trade-offs

- Works with MySQL; would work with PostgreSQL with small changes to the queries
- Local file storage is the default; S3 is optional
- The server's time zone is UTC, which is clearly written down for local testing.
- The default file size limit is 10MB, but you can change it using env
- No real-time notifications (WebSocket)—not in scope for now, but noted below

---

## What I'd Add Next

- Notifications in real time through WebSocket when content is approved
- Content versioning, which lets teachers make changes without losing their history
- A good admin dashboard (for the principal) to make it easier to review content
- Support for multiple tenants if this needs to grow to include more schools

---

## 📮 Postman Collection & API Testing

### **Direct API Testing**
All API endpoints are documented in **`curl.md`** with ready-to-use commands that you can copy-paste directly into:
- **Terminal** (curl commands)
- **Postman** (import as raw requests)
- **Insomnia** (import as HTTP requests)
- **Any API client** (use the provided examples)

### **Quick Test Commands**
```bash
# Create users and test complete flow
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Teacher","email":"test@school.com","password":"test123","role":"teacher"}'

# Login and get token
TEACHER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@school.com","password":"test123"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test all endpoints with provided examples
# See curl.md for complete API reference
```

### **Complete API Reference**
- **📋 curl.md**: 50+ ready-to-use API examples
- **🔗 All Endpoints**: Auth, Content, Public, Analytics
- **⚡ Quick Copy**: Direct terminal commands
- **📝 Documentation**: Request/Response examples
- **🐛 Debug Commands**: Troubleshooting helpers

### **Test Coverage**
- User Registration & Login  
- Content Upload & Approval  
- Public Broadcasting APIs  
- Analytics & Performance  
- Error Handling & Edge Cases  
- Bonus Features (Redis, S3, Rate Limiting)  

**No Postman collection needed** - use curl.md for direct API testing!

---

## 🚀 Render Deployment

### **Quick Deploy to Render**

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

2. **Deploy on Render**
- Go to [dashboard.render.com](https://dashboard.render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the repository
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

3. **Add Database**
- In Render dashboard: "New +" → "MySQL"
- Name: `content-broadcasting-db`
- Plan: Free
- Connect to your web service

4. **Environment Variables**
Render will automatically set:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (auto-generated)

### **Render-Specific Files**

**`render.yaml`** - Auto-configuration file
**`Procfile`** - Process definition
**`.env.render`** - Environment template

### **Deployment URL**

Once deployed, your API will be available at:
```
https://your-app-name.onrender.com
```

### **Important Notes for Render**

- **Port**: Render uses port 10000 (auto-set)
- **Database**: MySQL service automatically connects
- **File Storage**: Local storage (uploads directory)
- **Free Tier Limitations**: 
  - Redis/S3 disabled (save resources)
  - 512MB RAM limit
  - Auto-sleep after 15 minutes inactivity

### **Test Your Deployment**

```bash
# Test health endpoint
curl https://your-app-name.onrender.com/

# Test API endpoints
curl https://your-app-name.onrender.com/content/live/1
```

---

