const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    message,
    ...data
  });
};

const sendError = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    error: error.message || error
  });
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
};
