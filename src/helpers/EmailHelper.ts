import { mailTransporter } from '../config/Mail';
import { JupyterHubRequest } from '../models/JupyterHubRequest';
import MailTemplates from './mail-templates/MailTemplates';

export function sendJHRequestCreatedMail(jupyterHubRequest: JupyterHubRequest) {
  mailTransporter
    .sendMail({
      from: '"JHaaS Portal" <jhaas@test.local>',
      to: jupyterHubRequest.creator.email,
      subject: 'Jupyter Hub Request Created',
      text: `Hey, this is you: ${JSON.stringify(jupyterHubRequest)}`,
      html: require('./mail-templates/RequestCreatedMail.html')
    })
    .then(() => console.log('Mail sent.'))
    .catch((err) => console.log(err));
}

export function sendJupyterAccepted(jupyter: JupyterHubRequest) {
  sendMail(
    jupyter,
    'Your Request has been accepted',
    MailTemplates.JupyterAcceptedText({ jupyter, user: jupyter.creator }),
    MailTemplates.JupyterAcceptedHtml({ jupyter, user: jupyter.creator })
  );
}

function sendMail(jupyter: JupyterHubRequest, subject: string, text: string, html: string) {
  mailTransporter
    .sendMail({
      from: '"JHaaS Portal" <jhaas@test.local>',
      to: jupyter.creator.email,
      subject,
      text,
      html
    })
    .then(() => console.log('Mail sent.'))
    .catch((err) => console.log(err));
}
