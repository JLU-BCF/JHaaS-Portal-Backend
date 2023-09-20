export default {
  AUTHENTIK_FQDN: process.env.AUTHENTIK_FQDN || 'authentik',
  AUTHENTIK_URL: process.env.AUTHENTIK_URL || 'http://authentik:9000',
  AUTHENTIK_NAME: process.env.AUTHENTIK_NAME || 'JHaaS Evaluation Authentik',
  FEEDBACK_MAIL_ADDRESS: process.env.FEEDBACK_MAIL_ADDRESS || 'feedback@jhaas.local'
};
