import pug, { compileTemplate } from 'pug';
import { MAIL_TEMPLATE_DIR } from '../config/Mail';

const formats = ['text', 'html'];
const templates = [
  'JupyterCreated',
  'JupyterAccepted',
  'JupyterRejected',
  'JupyterCanceled',
  'JupyterDeployed',
  'JupyterDegrated',
  'JupyterFailed',
  'JupyterChangeCreated',
  'JupyterChangeAccepted',
  'JupyterChangeRejected',
  'JupyterChangeCanceled',
  'UserCreated'
];

const methods: { [key: string]: { [key: string]: compileTemplate } } = {};

templates.forEach((template) => {
  methods[template] = {};
  formats.forEach((format) => {
    methods[template][format] = pug.compileFile(`${MAIL_TEMPLATE_DIR}/${format}/${template}.pug`);
  });
});

export default methods;
