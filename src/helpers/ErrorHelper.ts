import { Response } from 'express';

export const genericError = {
  forbidden: (res: Response, msg?: string) => respondGenericError(res, 403, msg || 'Not allowed.'),
  notFound: (res: Response, msg?: string) => respondGenericError(res, 404, msg || 'Not Found.'),
  unprocessableEntity: (res: Response, msg?: string) =>
    respondGenericError(res, 422, msg || 'Invalid Input.'),
  internalServerError: (res: Response, msg?: string) =>
    respondGenericError(res, 500, msg || 'Oops - Something went wrong.')
};

function respondGenericError(res: Response, status: number, msg: string) {
  res.status(status).json(msg);
}
