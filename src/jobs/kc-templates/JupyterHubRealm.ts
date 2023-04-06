import { JH_DOMAIN } from '../../config/Config';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';

// TODO generate
function generateSecret(): string {
  return 'generated';
}

// TODO configure client correctly
export function getJupyterHubRealm(jh: JupyterHubRequest) {
  return {
    realm: `jh-${jh.slug}`,
    enabled: true,
    sslRequired: 'external',
    registrationAllowed: true,
    registrationEmailAsUsername: true,
    users: [
      {
        username: jh.creator.email,
        email: jh.creator.email,
        firstName: jh.creator.firstName,
        lastName: jh.creator.lastName,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: generateSecret()
          }
        ],
        clientRoles: {
          'realm-management': ['manage-users', 'query-users', 'view-users'],
          account: ['manage-account']
        }
      }
    ],
    clients: [
      {
        clientId: 'jupyter-hub',
        directAccessGrantsEnabled: true,
        enabled: true,
        fullScopeAllowed: true,
        baseUrl: `${jh.slug}.${JH_DOMAIN}/`,
        redirectUris: [`${jh.slug}.${JH_DOMAIN}/*`],
        secret: generateSecret()
      }
    ]
  };
}
