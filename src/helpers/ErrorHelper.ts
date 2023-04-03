import { Response } from 'express';

export function generic500Error(res: Response) {
  res
    .status(500)
    .end(
      'Oops - Something went wrong. Please contact an administrator if this error occurs repeatedly.'
    );
}

export function generic404Error(res: Response) {
  res.status(404).end('Not Found.');
}

export function generic403Error(res: Response) {
  res.status(403).end('Not allowed.');
}
