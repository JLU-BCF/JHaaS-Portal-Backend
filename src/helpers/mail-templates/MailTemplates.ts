import pug, { compileTemplate } from 'pug';

const formats = ['text', 'html'];
const templates = [
  'JupyterCreated',
  'JupyterAccepted',
  'JupyterRejected',
  'JupyterCanceled',
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
    methods[template][format] = pug.compileFile(`${__dirname}/${format}/${template}.pug`);
  });
});

export default methods;
