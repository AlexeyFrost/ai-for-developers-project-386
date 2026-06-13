import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  statusCode: number;
  code: string;
  details?: string[];

  constructor(statusCode: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = 'Ресурс не найден'): HttpError {
  return new HttpError(404, 'not_found', message);
}

export function conflict(message = 'Слот уже занят'): HttpError {
  return new HttpError(409, 'slot_conflict', message);
}

export function validationError(message = 'Данные запроса невалидны', details?: string[]): HttpError {
  return new HttpError(422, 'validation_error', message, details);
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(422).json({
      code: 'validation_error',
      message: 'Некорректный JSON в теле запроса',
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    code: 'internal_error',
    message: 'Внутренняя ошибка сервера',
  });
};
