const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

const { errorHandler, asyncHandler, notFoundHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const publicRoutes = require('./routes/public');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/content', publicRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Content Broadcasting System API',
    current_time: new Date().toISOString(),
    current_time_local: new Date().toString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initDatabase();
    await connectRedis(); 
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
