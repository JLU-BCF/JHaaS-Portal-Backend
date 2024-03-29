// DISCRIMINATOR is hardcoded as it defines this export!
// Increment it and update Frontend Configuration, if this export is touched!
export default {
  DISCRIMINATOR: 'v0.1.1',
  AUTHENTIK_FQDN: process.env.AUTHENTIK_FQDN || 'authentik',
  AUTHENTIK_URL: process.env.AUTHENTIK_URL || 'http://authentik:9000',
  AUTHENTIK_NAME: process.env.AUTHENTIK_NAME || 'Authentik',
  AUTHENTIK_CONFIG_TOTP: process.env.AUTHENTIK_CONFIG_TOTP,
  AUTHENTIK_CONFIG_WEBAUTHN: process.env.AUTHENTIK_CONFIG_WEBAUTHN,
  AUTHENTIK_CONFIG_STATIC: process.env.AUTHENTIK_CONFIG_STATIC,
  AUTHENTIK_CONFIG_PASSWORD: process.env.AUTHENTIK_CONFIG_PASSWORD,
  MAIL_FEEDBACK_ADDRESS: process.env.MAIL_FEEDBACK_ADDRESS || 'feedback@jhaas.local',
  TOS_ADDRESS: process.env.TOS_ADDRESS || '/api/tos/latest',
  DOCS_ADDRESS: process.env.DOCS_ADDRESS || '/docs/'
};
