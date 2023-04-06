import k8s from '@kubernetes/client-node';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';

export function getTerraformWorkerJob(jh: JupyterHubRequest): k8s.V1Job {
  return {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata: {
      creationTimestamp: null,
      name: `tf-worker-${jh.slug}`,
      namespace: k8sConf.K8S_TF_NS,
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
      template: {
        metadata: {
          labels: {
            'jupyter-hub-request': jh.id
          }
        },
        spec: {
          containers: [
            {
              name: `tf-worker-${jh.slug}`,
              image: k8sConf.K8S_TF_IMAGE,
              env: [
                {
                  name: 'JH_SLUG',
                  value: jh.slug
                },
                {
                  name: 'JH_IMAGE',
                  value: jh.containerImage
                },
                {
                  name: 'KEYCLOAK_CONF',
                  valueFrom: {
                    secretKeyRef: {
                      name: `jh-sec-${jh.id}`,
                      key: 'KEYCLOAK_CONF'
                    }
                  }
                }
              ],
              volumeMounts: [
                {
                  mountPath: '/tf-state',
                  name: 'tf-state'
                }
              ]
            }
          ],
          restartPolicy: 'Never',
          volumes: [
            {
              name: 'tf-state',
              persistentVolumeClaim: {
                claimName: `jh-state-${jh.id}`
              }
            }
          ]
        }
      },
      backoffLimit: 4
    },
    status: {}
  };
}
