const { checkJwt } = require('../config/auth0');

const authMiddleware = {
  validateToken: checkJwt,
  
  errorHandler: (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Invalid or expired token',
        details: err.message
      });
    }
    next(err);
  }
};

module.exports = authMiddleware;