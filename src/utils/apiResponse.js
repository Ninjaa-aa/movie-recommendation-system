class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null }) {
    const response = {
      success: true,
      message,
      data
    };
    console.log('Sending success response:', response);
    return res.status(statusCode).json(response);
  }

  static error(res, { statusCode = 500, message = 'Error', error = null }) {
    const response = {
      success: false,
      message,
      error
    };
    console.log('Sending error response:', response);
    return res.status(statusCode).json(response);
  }
}

module.exports = { ApiResponse };