/**
 * GIAI ĐOẠN 4: REQUEST LOGGER MIDDLEWARE
 * Chương 8: Express Middleware cho logging
 */

const morgan = require('morgan');

/**
 * Custom token để log thêm thông tin
 */
morgan.token('id', (req) => req.id);
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('query', (req) => JSON.stringify(req.query));

/**
 * Development logger format
 */
const developmentFormat = ':method :url :status :res[content-length] - :response-time ms';

/**
 * Production logger format
 */
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Custom logger middleware
 */
const requestLogger = (req, res, next) => {
  // Assign unique request ID
  req.id = Date.now() + Math.random();
  
  // Log request start
  console.log(`[${req.id}] ${req.method} ${req.originalUrl}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log(`[${req.id}] Query:`, req.query);
  }
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`[${req.id}] Body:`, req.body);
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    console.log(`[${req.id}] Response:`, {
      status: res.statusCode,
      success: body?.success,
      message: body?.message
    });
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Get appropriate morgan logger based on environment
 */
const getMorganLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return morgan(productionFormat);
  } else {
    return morgan(developmentFormat, {
      // Only log errors in development for cleaner output
      skip: (req, res) => res.statusCode < 400
    });
  }
};

module.exports = {
  requestLogger,
  getMorganLogger
};
