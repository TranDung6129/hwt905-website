/**
 * GIAI ĐOẠN 8: ERROR RESPONSE CLASS
 * Custom error class cho consistent error handling
 */

class ErrorResponse extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
