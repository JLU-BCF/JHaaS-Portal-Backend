import { Request, Response } from 'express';
import Tos from '../models/Tos';
import TosRepository from '../repositories/TosRepository';
import { genericError } from '../helpers/ErrorHelper';
import { getTosProperties, validationErrors } from '../helpers/BodyParserHelper';
import { DeleteResult } from 'typeorm';

function list(req: Request, res: Response, scope = 'published'): void {
  let listFunction: CallableFunction;
  switch (scope) {
    case 'all':
      listFunction = TosRepository.findAll;
      break;
    case 'pending':
      listFunction = TosRepository.findPending;
      break;
    case 'published':
    default:
      listFunction = TosRepository.findPublished;
      break;
  }

  return listFunction()
    .then((tosList: Tos[]) => {
      return res.json(tosList);
    })
    .catch((err: unknown) => {
      console.log(err);
      return genericError.internalServerError(res);
    });
}

function read(req: Request, res: Response, scope = 'latest', html = false): void {
  let readFunction: CallableFunction;
  switch (scope) {
    case 'next':
      readFunction = TosRepository.findNext;
      break;
    case 'latest':
    default:
      readFunction = TosRepository.findLatest;
      break;
  }

  return readFunction()
    .then((tos: Tos) => {
      if (tos) {
        if (html) {
          return res.send(tos.text_html);
        }
        return res.json(tos);
      }

      return genericError.notFound(res);
    })
    .catch((err: unknown) => {
      console.log(err);
      return genericError.internalServerError(res);
    });
}

class TosController {
  public listPublished(req: Request, res: Response): void {
    list(req, res, 'published');
  }

  public listPending(req: Request, res: Response): void {
    list(req, res, 'pending');
  }

  public listAll(req: Request, res: Response): void {
    list(req, res, 'all');
  }

  public latest(req: Request, res: Response): void {
    read(req, res, 'latest');
  }

  public latestHtml(req: Request, res: Response): void {
    read(req, res, 'latest', true);
  }

  public next(req: Request, res: Response): void {
    read(req, res, 'next');
  }

  public nextHtml(req: Request, res: Response): void {
    read(req, res, 'next', true);
  }

  public read(req: Request, res: Response): void {
    const { id } = req.params;

    TosRepository.findPublishedById(id)
      .then((tos: Tos) => {
        if (!tos) {
          return genericError.notFound(res);
        }
        return res.json(tos);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public find(req: Request, res: Response): void {
    const { id } = req.params;

    TosRepository.findById(id)
      .then((tos: Tos) => {
        if (!tos) {
          return genericError.notFound(res);
        }
        return res.json(tos);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public create(req: Request, res: Response): void {
    if (validationErrors(req, res)) return;
    const tosProps = getTosProperties(req);

    if (!tosProps.draft && !tosProps.published_date) {
      res.status(401).json({ msg: 'Need to accept publication terms.' });
      return;
    }

    TosRepository.createOne(new Tos(tosProps))
      .then((instance) => {
        res.json(instance);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public update(req: Request, res: Response): void {
    if (validationErrors(req, res)) return;
    const { id } = req.params;

    TosRepository.findById(id)
      .then((tos: Tos) => {
        if (!tos) {
          return genericError.notFound(res);
        }
        if (!tos.draft) {
          return genericError.forbidden(res);
        }
        const tosProps = getTosProperties(req);

        Object.assign(
          tos,
          Object.keys(tosProps)
            .filter((k) => tosProps[k] != null)
            .reduce((a, k) => ({ ...a, [k]: tosProps[k] }), {})
        );

        TosRepository.updateOne(tos)
          .then((instace: Tos) => {
            return res.json(instace);
          })
          .catch((err: unknown) => {
            console.log(err);
            return genericError.internalServerError(res);
          });
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public delete(req: Request, res: Response): void {
    const id = req.params.id;

    TosRepository.findById(id)
      .then((tos: Tos) => {
        if (!tos) {
          return genericError.notFound(res);
        }
        if (!tos.draft) {
          return genericError.forbidden(res);
        }

        TosRepository.deleteById(tos.id)
          .then((deleteResult: DeleteResult) => {
            if (deleteResult.affected) {
              return res.json('Deleted.');
            }
            return genericError.notFound(res);
          })
          .catch((err) => {
            console.log(err);
            return genericError.internalServerError(res);
          });
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new TosController();
