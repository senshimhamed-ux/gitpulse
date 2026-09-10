/* eslint-disable no-unused-vars */

/** 404 handler for unmatched routes. */
function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

/** Generic error handler — keeps stack traces out of API responses. */
function errorHandler(err, req, res, next) {
  console.error(`[gitpulse-api] ${err.stack || err.message}`);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message
  });
}

module.exports = { notFound, errorHandler };
