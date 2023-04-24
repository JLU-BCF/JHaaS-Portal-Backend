import { mailTransporter } from '../config/Mail';
import { JupyterHubRequest } from '../models/JupyterHubRequest';

export function sendJHRequestCreatedMail(jupyterHubRequest: JupyterHubRequest) {
  mailTransporter
    .sendMail({
      from: '"JHaaS Portal" <jhaas@test.local>',
      to: jupyterHubRequest.creator.email,
      subject: 'Jupyter Hub Request Created',
      text: `Hey, this is you: ${JSON.stringify(jupyterHubRequest)}`,
      html: `<p>Hey, this is you:</p><pre>${JSON.stringify(jupyterHubRequest)}</pre>`
    })
    .then(() => console.log('Mail sent.'))
    .catch((err) => console.log(err));
}
