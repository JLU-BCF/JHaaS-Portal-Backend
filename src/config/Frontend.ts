export default {
  AUTHENTIK_FQDN: process.env.AUTHENTIK_FQDN || 'authentik',
  AUTHENTIK_URL: process.env.AUTHENTIK_URL || 'http://authentik:9000',
  AUTHENTIK_NAME: process.env.AUTHENTIK_NAME || 'Authentik',
  MAIL_FEEDBACK_ADDRESS: process.env.MAIL_FEEDBACK_ADDRESS || 'feedback@jhaas.local'
};