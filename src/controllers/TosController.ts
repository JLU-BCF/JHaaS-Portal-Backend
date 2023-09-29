import { Request, Response } from 'express';
import path from 'path';

class AdminController {
  public list(req: Request, res: Response): void {
    res.status(501).end('Not yet implemented.');
  }

  public latest(req: Request, res: Response): void {
    return res.sendFile(path.join(__dirname, '../static/tos', 'latest.html'));
  }

  public read(req: Request, res: Response): void {
    res.status(501).end('Not yet implemented.');
  }

  public create(req: Request, res: Response): void {
    res.status(501).end('Not yet implemented.');
  }
}

export default new AdminController();
