import { Request, Response } from 'express';
import { marked } from 'marked';
import Tos from '../models/Tos';
import TosRepository from '../repositories/TosRepository';
import { genericError } from '../helpers/ErrorHelper';
import path from 'path';

class AdminController {
  public list(req: Request, res: Response): void {
    TosRepository.findAll()
      .then((tos: Tos[]) => {
        return res.json(tos);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public latest(req: Request, res: Response): void {
    return res.sendFile(path.join(__dirname, '../static/tos', 'latest.html'));
  }

  public read(req: Request, res: Response): void {
    res.status(501).end('Not yet implemented.');
  }

  public create(req: Request, res: Response): void {
    const { text, date } = req.body;
    const tos = new Tos(text, date);
    tos.text_html = marked.parse(tos.text_markdown);

    res.json(tos);

    // TosRepository.createOne(tos)
    //   .then((instance) => {
    //     res.json(instance);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return genericError.internalServerError(res);
    //   });
  }
}

export default new AdminController();
