const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || []
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Authentication token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Authentication token has expired'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File Too Large',
      message: 'File size exceeds the maximum allowed limit'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too Many Files',
      message: 'Number of files exceeds the maximum allowed limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected File',
      message: 'Unexpected file field'
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: 'Email already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Reference Error',
      message: 'Referenced record does not exist'
    });
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      error: 'Database Access Denied',
      message: 'Database connection failed'
    });
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return res.status(500).json({
      error: 'Database Not Found',
      message: 'Database does not exist'
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(500).json({
      error: 'Connection Refused',
      message: 'Database connection refused'
    });
  }

  if (req.file && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid File Type',
      message: 'Only JPG, PNG, and GIF files are allowed'
    });
  }

  res.status(err.status || 500).json({
    error: err.error || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};
