// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;

  // Log full error in dev, minimal in prod
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.url}`, err);
  } else {
    console.error(`[ERROR] ${status} — ${err.message}`);
  }

  // Postgres error handling
  if (err.code === '23503') {
    status = 400;
    err.message = 'Invalid reference: The provided ID does not exist in the related table.';
  } else if (err.code === '23505') {
    status = 409;
    err.message = 'Duplicate record: A record with these details already exists.';
  }

  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;