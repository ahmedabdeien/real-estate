exports.success = (res, data, message = 'تمت العملية بنجاح', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

exports.paginated = (res, data, total, page, limit, message = 'تمت العملية بنجاح') => {
  return res.status(200).json({
    success: true, message, data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

exports.error = (res, message = 'حدث خطأ في الخادم', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

// aliases used in some controllers
exports.sendSuccess = (res, data, message = 'تمت العملية بنجاح', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};
exports.sendError = (res, message = 'حدث خطأ في الخادم', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
