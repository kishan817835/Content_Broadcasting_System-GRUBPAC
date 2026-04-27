const { pool } = require('../config/database');

class Content {
  static async create(title, description, subject, fileUrl, fileType, fileSize, uploadedBy, startTime, endTime) {
    const [result] = await pool.query(
      `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')`,
      [title, description, subject, fileUrl, fileType, fileSize, uploadedBy, startTime, endTime]
    );
    return { id: result.insertId, title, description, subject, file_url: fileUrl, file_type: fileType, file_size: fileSize, uploaded_by: uploadedBy, start_time: startTime, end_time: endTime, status: 'uploaded' };
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name, u.email as uploader_email,
             approver.name as approver_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  }

  static async findByTeacher(teacherId) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.uploaded_by = ?
      ORDER BY c.created_at DESC
    `, [teacherId]);
    return rows;
  }

  static async findByStatus(status) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.status = ?
      ORDER BY c.created_at DESC
    `, [status]);
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      ORDER BY c.created_at DESC
    `);
    return rows;
  }

  static async updateStatus(id, status, approvedBy = null, rejectionReason = null) {
    const approvedAt = status === 'approved' ? new Date() : null;
    const [result] = await pool.query(
      `UPDATE content 
       SET status = ?, approved_by = ?, approved_at = ?, rejection_reason = ? 
       WHERE id = ?`,
      [status, approvedBy, approvedAt, rejectionReason, id]
    );
    return await this.findById(id);
  }

  static async getApprovedContent(teacherId, currentTime) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.status = 'approved' 
      AND c.uploaded_by = ?
      AND (c.start_time IS NULL OR c.start_time <= ?)
      AND (c.end_time IS NULL OR c.end_time >= ?)
      ORDER BY c.subject, c.created_at
    `, [teacherId, currentTime, currentTime]);
    return rows;
  }

  static async getApprovedContentBySubject(subject, currentTime) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as uploader_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.status = 'approved' 
      AND c.subject = ?
      AND (c.start_time IS NULL OR c.start_time <= ?)
      AND (c.end_time IS NULL OR c.end_time >= ?)
      ORDER BY c.created_at
    `, [subject, currentTime, currentTime]);
    return rows;
  }

  static async getSubjects() {
    const [rows] = await pool.query('SELECT DISTINCT subject FROM content WHERE status = ? ORDER BY subject', ['approved']);
    return rows.map(row => row.subject);
  }
}

module.exports = Content;
