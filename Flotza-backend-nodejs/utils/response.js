const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const errorResponse = (message = 'Error', data = null) => ({
  success: false,
  message,
  data,
});

module.exports = { successResponse, errorResponse };