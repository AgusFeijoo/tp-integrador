const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Ya existe un registro con estos datos';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Registro no encontrado';
    } else {
      statusCode = 400;
      message = 'Error en la base de datos';
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Datos inválidos';
  }

  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };

