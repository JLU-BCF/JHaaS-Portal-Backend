import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';
import { getJupyterHubRealm } from '../kc-templates/JupyterHubRealm';

export function getRealmImportOperatorJob(jh: JupyterHubRequest): object {
  return {
    kind: 'KeycloakRealmImport',
    apiVersion: 'k8s.keycloak.org/v2alpha1',
    metadata: {
      creationTimestamp: null,
      name: `kc-realm-${jh.slug}`,
      namespace: k8sConf.K8S_KC_NS,
      labels: {
        'jupyter-hub-request': jh.id
      }
    },
    spec: {
      selector: {
        matchLabels: {
          'jupyter-hub-request': jh.id
        }
      },
      keycloakCRName: '',
      realm: getJupyterHubRealm(jh)
    },
    status: {}
  };
}
