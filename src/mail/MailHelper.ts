import { mailTransporter, MAIL_FROM, MAIL_COPY_ADDRESSES } from '../config/Mail';
import { JupyterHubRequest } from '../models/JupyterHubRequest';
import User from '../models/User';
import MailTemplates from './MailTemplates';

export const MailHelper = {
  sendJupyterCreated: jupyterTemplate('JupyterCreated', true),
  sendJupyterAccepted: jupyterTemplate('JupyterAccepted'),
  sendJupyterRejected: jupyterTemplate('JupyterRejected'),
  sendJupyterCanceled: jupyterTemplate('JupyterCanceled'),
  sendJupyterChangeCreated: jupyterTemplate('JupyterChangeCreated', true),
  sendJupyterChangeAccepted: jupyterTemplate('JupyterChangeAccepted'),
  sendJupyterChangeRejected: jupyterTemplate('JupyterChangeRejected'),
  sendJupyterChangeCanceled: jupyterTemplate('JupyterChangeCanceled'),
  sendUserCreated: userTemplate('UserCreated', true)
};

const templateSubjects: { [key: string]: string } = {
  JupyterCreated: 'Your Jupyter Hub Request has been Created',
  JupyterAccepted: 'Your Jupyter Hub Request has been Accepted',
  JupyterRejected: 'Your Jupyter Hub Request has been Rejected',
  JupyterCanceled: 'Your Jupyter Hub Request has been Canceled',
  JupyterChangeCreated: 'Your Change Request has been Created',
  JupyterChangeAccepted: 'Your Change Request has been Accepted',
  JupyterChangeRejected: 'Your Change Request has been Rejected',
  JupyterChangeCanceled: 'Your Change Request has been Canceled',
  UserCreated: 'Welcome to the JHaaS Portal'
};

function jupyterTemplate(template: string, copy?: boolean) {
  return (jupyter: JupyterHubRequest, changeRequestId?: string) => {
    const changeRequest = changeRequestId && jupyter.getChangeRequestById(changeRequestId);
    const mailOpts = { user: jupyter.creator, jupyter, changeRequest };

    sendMail(jupyter.creator.email, template, mailOpts, copy);
  };
}

function userTemplate(template: string, copy?: boolean) {
  return (user: User) => {
    sendMail(user.email, template, { user }, copy);
  };
}

function sendMail(to: string, template: string, mailOpts: object, copy?: boolean) {
  mailTransporter
    .sendMail({
      from: MAIL_FROM,
      to,
      cc: copy ? MAIL_COPY_ADDRESSES : undefined,
      subject: templateSubjects[template],
      text: MailTemplates[template]['text'](mailOpts),
      html: MailTemplates[template]['html'](mailOpts)
    })
    .then(() => console.log('Mail sent.'))
    .catch((err) => console.log(err));
}
