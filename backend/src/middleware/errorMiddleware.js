const notFound = (req, res) => {
  res.status(404).json({
    msg: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ msg: "Invalid JSON in request body" });
  }

  console.log(error);

  const status = error.status || error.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message || "Internal server error";

  return res.status(status).json({ msg: message });
};

module.exports = { notFound, errorHandler };
