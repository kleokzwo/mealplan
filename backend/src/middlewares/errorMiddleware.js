export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    message: 'Route nicht gefunden.',
  });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || 'Interner Serverfehler.',
  });
};
