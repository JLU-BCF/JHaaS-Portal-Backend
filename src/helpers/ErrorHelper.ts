import { Response } from 'express';

export const genericError = {
  forbidden: (res: Response, msg?: string) =>
    respondGenericError(res, 403, msg || 'Action not allowed.'),
  notFound: (res: Response, msg?: string) =>
    respondGenericError(res, 404, msg || 'Resource not Found.'),
  unprocessableEntity: (res: Response, msg?: string) =>
    respondGenericError(res, 422, msg || 'Request could not be processed.'),
  internalServerError: (res: Response, msg?: string) =>
    respondGenericError(res, 500, msg || 'Oops - Something went wrong.')
};

function respondGenericError(res: Response, status: number, msg: string) {
  res.status(status).json(msg);
}
