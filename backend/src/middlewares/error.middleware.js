function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = Number(err?.status || 500);
  const message = err?.message || "Error interno del servidor";

  if (status >= 500) {
    console.error("UNHANDLED ERROR:", err);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
