
MySQL Database Setup

 Step 1: Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE content_broadcasting;
```

### Step 2: Create User (Optional - if you want separate user)

```sql
CREATE USER 'content_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON content_broadcasting.* TO 'content_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Use the Database

```sql
USE content_broadcasting;
```

### Step 4: Create Tables

#### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('principal', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Content Table
```sql
CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by INT,
    status ENUM('uploaded', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'uploaded',
    rejection_reason TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### Content Analytics Table
```sql
CREATE TABLE IF NOT EXISTS content_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    view_count INT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_content (content_id),
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 5: Insert Sample Data (Optional)

#### Sample Principal
```sql
INSERT INTO users (name, email, password_hash, role) VALUES 
('Principal Smith', 'principal@school.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'principal');
```

#### Sample Teacher
```sql
INSERT INTO users (name, email, password_hash, role) VALUES 
('John Doe', 'john@school.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
('Jane Smith', 'jane@school.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher');
```

Note: The password hash above is for 'password' - you can change it.

### Step 6: Verify Tables

```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE content;
DESCRIBE content_analytics;
```

### Step 7: Check Data

```sql
SELECT * FROM users;
SELECT * FROM content;
```

## Environment Configuration

Make sure your `.env` file has these values:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=content_broadcasting
DB_USER=root
DB_PASSWORD=1234
JWT_SECRET=your-super-secret-jwt-key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Troubleshooting

### Common Issues:

1. **Access Denied Error**: Make sure MySQL user has proper permissions
2. **Database Not Found**: Ensure database is created before starting app
3. **Connection Failed**: Check MySQL service is running
4. **Port Issues**: Default MySQL port is 3306

### Reset Database (if needed)

```sql
DROP DATABASE IF EXISTS content_broadcasting;
CREATE DATABASE content_broadcasting;
```

Then run all CREATE TABLE statements again.

## Database Architecture Note

**Important**: This system uses a simplified database structure with only 3 tables:
- `users` - User authentication and roles
- `content` - Content storage and approval workflow  
- `content_analytics` - Usage tracking and analytics

The original assignment mentioned `content_slots` and `content_schedule` tables, but this implementation uses a more efficient time-based scheduling algorithm in the application layer (SchedulingService.js) instead of complex database scheduling tables.

## Auto-Creation

The Node.js application will automatically create tables when started if they don't exist, but the database must be created manually first.

## Testing Connection

You can test MySQL connection with:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

Enter your password when prompted. You should see `content_broadcasting` in the list.
