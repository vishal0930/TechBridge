// src/utils/apiResponse.js

export const successResponse = (res, data, statusCode = 200, meta = null) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;         // pagination info goes here
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};