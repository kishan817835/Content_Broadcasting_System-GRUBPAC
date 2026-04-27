# Content Broadcasting System - API Guide

Quick reference for all API endpoints. Perfect for testing and integration.

## Base URL
```
http://localhost:3000
```

## Quick Setup

### 1. Create Users
```bash
# Create a 
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Principal",
    "email": "principal@school.com",
    "password": "admin123",
    "role": "principal"
  }'

# Create a Teacher
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Teacher",
    "email": "teacher@school.com",
    "password": "teacher123",
    "role": "teacher"
  }'
```

### 2. Login and Get Tokens
```bash
# Principal Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@school.com",
    "password": "admin123"
  }'

# Teacher Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "teacher123"
  }'
```

Save the tokens from responses - you'll need them for API calls.

---

## Authentication APIs

### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Content Management APIs

### Upload Content (Teacher Only)
```bash
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "title=Math Chapter 1 Test" \
  -F "subject=Maths" \
  -F "description=First chapter test paper"

**Timing Options:**
- **With Time**: Content active only between start_time and end_time (UTC)
- **Without Time**: Content always active once approved
- **Time Format**: ISO 8601 UTC (e.g., "2026-04-27T06:00:00Z")
- **Time Zone**: Server uses UTC, convert from local time

**Examples:**
```bash
# Always active (no time specified)
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=Always Active" \
  -F "subject=Maths"

# Active at specific time (11:30 AM India = 6:00 AM UTC)
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=Timed Content" \
  -F "subject=Maths" \
  -F "start_time=2026-04-27T06:00:00Z" \
  -F "end_time=2026-04-27T23:59:59Z"
```

**File Requirements:**
- Images only: JPG, JPEG, PNG, GIF
- Maximum size: 10MB
- Unique filename generated automatically

### View My Uploaded Content (Teacher)
```bash
curl -X GET http://localhost:3000/api/content/my-content \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN"
```

### View All Content (Principal Only)
```bash
curl -X GET http://localhost:3000/api/content/all \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### View Pending Content (Principal Only)
```bash
curl -X GET http://localhost:3000/api/content/pending \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### Approve Content (Principal Only)
```bash
curl -X POST http://localhost:3000/api/content/approve/CONTENT_ID \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### Reject Content (Principal Only)
```bash
curl -X POST http://localhost:3000/api/content/reject/CONTENT_ID \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Content quality needs improvement"
  }'
```

### Get Available Subjects
```bash
curl -X GET http://localhost:3000/api/content/subjects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Public APIs (No Authentication Required)

### Get Live Content by Teacher
```bash
curl -X GET http://localhost:3000/content/live/TEACHER_ID
```

### Get Live Content by Teacher and Subject
```bash
curl -X GET http://localhost:3000/content/live/TEACHER_ID/Maths
```

**Note:** These endpoints are rate-limited (100 requests per 15 minutes) and cached for 60 seconds.

---

## Analytics APIs

### Get Subject Analytics (Principal/Teacher)
```bash
curl -X GET http://localhost:3000/api/analytics/subjects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Teacher Analytics (Principal/Own Teacher Only)
```bash
curl -X GET http://localhost:3000/api/analytics/teacher/TEACHER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Top Content (Principal Only)
```bash
curl -X GET "http://localhost:3000/api/analytics/top-content?limit=10" \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### Get Most Active Subject (Principal Only)
```bash
curl -X GET http://localhost:3000/api/analytics/most-active-subject \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### Get Daily Views (Principal Only)
```bash
curl -X GET "http://localhost:3000/api/analytics/daily-views?days=7" \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

---

## User Management APIs (Principal Only)

### Get All Teachers
```bash
curl -X GET http://localhost:3000/api/users/teachers \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

### Get All Users
```bash
curl -X GET http://localhost:3000/api/users/all \
  -H "Authorization: Bearer PRINCIPAL_JWT_TOKEN"
```

---

## File Access

### Access Uploaded Files (Local Storage)
```bash
curl -X GET http://localhost:3000/uploads/filename.jpg
```

### Access S3 Files (If AWS Configured)
```bash
curl -X GET https://your-bucket.s3.amazonaws.com/uploads/filename.jpg
```

---

## Common Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error description"
}
```

### Validation Error
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

### Rate Limit Error
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### No Content Available
```json
{
  "message": "No content available"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation failed) |
| 401 | Unauthorized (Invalid/missing token) |
| 403 | Forbidden (Wrong role/permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (Rate limit) |
| 500 | Internal Server Error |

---

## Testing Workflow Example

### Complete Flow: Upload → Approve → View

```bash
# 1. Teacher uploads content
TEACHER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F "file=@test-paper.jpg" \
  -F "title=Science Test" \
  -F "subject=Science" \
  -F "description=Biology test"

# 2. Principal approves content
PRINCIPAL_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X POST http://localhost:3000/api/content/approve/1 \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN"

# 3. Student views live content
curl -X GET http://localhost:3000/content/live/1
```

---

## Tips for Developers

### Token Management
```bash
# Save tokens to variables for easier testing
TEACHER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.com","password":"teacher123"}' | \
  jq -r '.token')

PRINCIPAL_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@school.com","password":"admin123"}' | \
  jq -r '.token')
```

### File Upload Testing
```bash
# Create a test image file
convert -size 400x300 xc:blue test-image.jpg

# Upload with the test file
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Test Content" \
  -F "subject=Maths"
```

### Check Response Headers
```bash
# Include response headers to see rate limit info
curl -I -X GET http://localhost:3000/content/live/1
```

### Debugging Tips
- Use `-v` flag for verbose curl output
- Check network issues with `--connect-timeout 10`
- Test JSON formatting with `jq` pipe: `| jq .`
- For file uploads, verify file path exists

---

## Environment Variables for Testing

Create a `.env` file for local testing:
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=content_broadcasting
DB_USER=root
DB_PASSWORD=1234
JWT_SECRET=test-secret-key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Redis Configuration (Optional - set to true to enable)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3 Configuration (Optional - set to true to enable)
S3_ENABLED=false
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Optional Features Setup

### Enable Redis Caching
```bash
# 1. Update .env
REDIS_ENABLED=true

# 2. Start Redis
docker-compose up -d redis

# 3. Restart application
npm run dev

# 4. Test caching (first call hits database, second call hits cache)
time curl -X GET http://localhost:3000/content/live/1
```

### Enable S3 Storage
```bash
# 1. Update .env with AWS credentials
S3_ENABLED=true
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# 2. Restart application
npm run dev

# 3. Upload file (will be stored in S3)
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=S3 Test" \
  -F "subject=Maths"
```

### Default Mode (No Optional Features)
The system works perfectly with both features disabled:
- Files stored locally in `uploads/` directory
- No caching - direct database calls
- All core features fully functional

---

## Content Timing & Troubleshooting

### When Content Shows "No content available"

**Check These Conditions:**
1. **Status**: Content must be "approved" (not "uploaded" or "rejected")
2. **Time Window**: Current time must be between start_time and end_time
3. **Teacher ID**: Must match the teacher who uploaded the content

### Time Zone Debugging

**Check Server Time:**
```bash
curl -X GET http://localhost:3000/
# Response includes current_time in UTC
```

**Common Time Issues:**
- **Local vs UTC**: 11:30 AM India = 6:00 AM UTC
- **Early Start**: Content start_time is in the future
- **Expired End**: Content end_time has passed

### Quick Fixes

**Option 1: Upload Without Time (Always Active)**
```bash
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=Always Active" \
  -F "subject=test"
# Don't include start_time/end_time
```

**Option 2: Use Current UTC Time**
```bash
# Get current UTC time from server, then upload
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=Current Time" \
  -F "subject=test" \
  -F "start_time=2026-04-27T05:00:00Z" \
  -F "end_time=2026-04-27T23:59:59Z"
```

**Option 3: Check Content Status**
```bash
# View pending content (principal)
curl -X GET http://localhost:3000/api/content/pending \
  -H "Authorization: Bearer PRINCIPAL_TOKEN"

# View all content (principal)
curl -X GET http://localhost:3000/api/content/all \
  -H "Authorization: Bearer PRINCIPAL_TOKEN"
```

### Content Visibility Formula
```
VISIBLE = (status == "approved") AND 
          (start_time <= current_time OR start_time IS NULL) AND
          (end_time >= current_time OR end_time IS NULL) AND
          (teacher_id matches requested ID)
```

---

## Performance Features

- **Caching**: Public API responses cached for 60 seconds
- **Rate Limiting**: 100 requests per 15 minutes on public endpoints
- **Analytics**: Automatic tracking of content views
- **Storage**: Automatic switching between local and S3 storage

---

## Troubleshooting

### Common Issues

1. **"No content available"**
   - Check if content is approved
   - Verify start/end time windows
   - Ensure teacher ID is correct

2. **401 Unauthorized**
   - Check if token is valid and not expired
   - Verify token format: `Authorization: Bearer TOKEN`

3. **403 Forbidden**
   - Check user role for the endpoint
   - Teachers can't access principal endpoints

4. **429 Too Many Requests**
   - Wait 15 minutes before retrying public endpoints
   - Use different teacher IDs for testing

5. **File Upload Issues**
   - Check file format (JPG/PNG/GIF only)
   - Verify file size under 10MB
   - Ensure file path exists

### Debug Commands
```bash
# Check server status
curl -X GET http://localhost:3000/

# Test authentication
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer INVALID_TOKEN"

# Check rate limits
curl -I -X GET http://localhost:3000/content/live/1
```

---

## Bonus Features in Action

### Redis Caching
```bash
# First call - hits database
time curl -X GET http://localhost:3000/content/live/1

# Second call within 60 seconds - hits cache
time curl -X GET http://localhost:3000/content/live/1
```

### Analytics Tracking
```bash
# View content (this increments analytics)
curl -X GET http://localhost:3000/content/live/1

# Check analytics
curl -X GET http://localhost:3000/api/analytics/subjects \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN"
```

That's it! You now have everything needed to test and integrate with the Content Broadcasting System.
