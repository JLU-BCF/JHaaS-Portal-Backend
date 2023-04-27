import pug, { compileTemplate } from 'pug';

const templates = ['JupyterAccepted'];

const methods: { [key: string]: compileTemplate } = {};

templates.forEach((template) => {
  methods[`${template}Html`] = pug.compileFile(`${__dirname}/html/${template}.pug`);
  methods[`${template}Text`] = pug.compileFile(`${__dirname}/text/${template}.pug`);
});

export default methods;
