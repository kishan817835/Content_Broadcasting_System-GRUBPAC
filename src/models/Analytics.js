const { pool } = require('../config/database');

class Analytics {
  static async trackContentView(contentId, teacherId, subject) {
    try {
      await pool.query(
        `INSERT INTO content_analytics (content_id, teacher_id, subject, view_count, last_accessed) 
         VALUES (?, ?, ?, 1, NOW()) 
         ON DUPLICATE KEY UPDATE 
         view_count = view_count + 1, 
         last_accessed = NOW()`,
        [contentId, teacherId, subject]
      );
    } catch (error) {
      console.log('Analytics tracking error:', error);
    }
  }

  static async getSubjectAnalytics() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          subject,
          COUNT(*) as total_content,
          SUM(view_count) as total_views,
          AVG(view_count) as avg_views_per_content,
          MAX(last_accessed) as last_accessed
        FROM content_analytics 
        GROUP BY subject 
        ORDER BY total_views DESC
      `);
      return rows;
    } catch (error) {
      console.log('Get subject analytics error:', error);
      return [];
    }
  }

  static async getTeacherAnalytics(teacherId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          subject,
          COUNT(*) as total_content,
          SUM(view_count) as total_views,
          AVG(view_count) as avg_views_per_content,
          MAX(last_accessed) as last_accessed
        FROM content_analytics 
        WHERE teacher_id = ?
        GROUP BY subject 
        ORDER BY total_views DESC
      `, [teacherId]);
      return rows;
    } catch (error) {
      console.log('Get teacher analytics error:', error);
      return [];
    }
  }

  static async getTopContent(limit = 10) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          ca.content_id,
          c.title,
          c.subject,
          ca.view_count,
          ca.last_accessed,
          u.name as teacher_name
        FROM content_analytics ca
        JOIN content c ON ca.content_id = c.id
        JOIN users u ON ca.teacher_id = u.id
        ORDER BY ca.view_count DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.log('Get top content error:', error);
      return [];
    }
  }

  static async getMostActiveSubject() {
    try {
      const [rows] = await pool.query(`
        SELECT subject, SUM(view_count) as total_views
        FROM content_analytics 
        GROUP BY subject 
        ORDER BY total_views DESC 
        LIMIT 1
      `);
      return rows[0] || null;
    } catch (error) {
      console.log('Get most active subject error:', error);
      return null;
    }
  }

  static async getDailyViews(days = 7) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE(last_accessed) as date,
          COUNT(*) as daily_views
        FROM content_analytics 
        WHERE last_accessed >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(last_accessed)
        ORDER BY date DESC
      `, [days]);
      return rows;
    } catch (error) {
      console.log('Get daily views error:', error);
      return [];
    }
  }

  static async initializeAnalyticsTable() {
    try {
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
    } catch (error) {
      console.log('Analytics table initialization error:', error);
    }
  }
}

module.exports = Analytics;
