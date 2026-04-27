const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('principal', 'teacher') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_id INT,
        slot_id INT,
        rotation_order INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (content_id) REFERENCES content(id),
        FOREIGN KEY (slot_id) REFERENCES content_slots(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_id INT NOT NULL,
        teacher_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        view_count INT DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_content (content_id),
        INDEX idx_subject (subject),
        INDEX idx_teacher (teacher_id),
        INDEX idx_last_accessed (last_accessed),
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { pool, initDatabase };
