import { Request, Response } from 'express';
import User from '../models/User';
import { validationResult } from 'express-validator';
import { JupyterHubChangeRequest, JupyterHubRequest } from '../models/JupyterHubRequest';

export function parseUser(req: Request): User {
  const { firstName, lastName, email } = req.body;

  const user: User = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  return user;
}

function getJupyterHubBaseRequestProperties(req: Request) {
  // extracting properties explicitly to prevent injection of properties we don't want to set from request
  const { name, description, userConf, containerImage, notebookDefaultUrl, startDate, endDate } =
    req.body;
  return {
    name,
    description,
    userConf,
    containerImage,
    notebookDefaultUrl,
    startDate,
    endDate,
    creator: req.user
  };
}

export function parseJupyterHubRequest(req: Request): JupyterHubRequest {
  const { slug } = req.body;
  return new JupyterHubRequest({
    slug,
    ...getJupyterHubBaseRequestProperties(req)
  });
}

export function parseJupyterHubChangeRequest(req: Request): JupyterHubChangeRequest {
  return new JupyterHubChangeRequest(getJupyterHubBaseRequestProperties(req));
}

export function validationErrors(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errors.array());
    return true;
  }
  return false;
}
