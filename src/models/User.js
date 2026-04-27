const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(name, email, password, role) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    return { id: result.insertId, name, email, role, created_at: new Date() };
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async getTeachers() {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE role = ? ORDER BY name', ['teacher']);
    return rows;
  }
}

module.exports = User;
