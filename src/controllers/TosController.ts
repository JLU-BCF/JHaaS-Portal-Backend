import { Request, Response } from 'express';
import Tos from '../models/Tos';
import TosRepository from '../repositories/TosRepository';
import { genericError } from '../helpers/ErrorHelper';

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
      if (html) {
        if (tos) {
          return res.send(tos.text_html);
        } else {
          return genericError.notFound(res);
        }
      }
      return res.json(tos);
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
        if (!tos) return genericError.notFound(res);
        return res.json(tos);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public create(req: Request, res: Response): void {
    const { textMarkdown, validityStart, draft, publish } = req.body;
    const publishedDate = !draft && publish ? new Date() : null;

    if (!draft && !publish) {
      res.status(401).json({ msg: 'Need to accept.' });
      return;
    }

    const tos = new Tos({
      text_markdown: textMarkdown,
      draft: draft,
      validity_start: validityStart,
      published_date: publishedDate
    });

    TosRepository.createOne(tos)
      .then((instance) => {
        res.json(instance);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new TosController();
