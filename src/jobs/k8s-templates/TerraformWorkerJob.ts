import k8s from '@kubernetes/client-node';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';
import { RELEASE_NAME } from '../../config/Config';

// TODO: use S3 instead of volume
export function getTerraformWorkerJob(jh: JupyterHubRequest): k8s.V1Job {
  return {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata: {
      creationTimestamp: null,
      name: `tf-worker-${jh.id}`,
      namespace: k8sConf.K8S_TF_NS,
      labels: {
        'jupyter-hub-request': jh.id
      }
    },
    spec: {
      template: {
        metadata: {
          labels: {
            'jupyter-hub-request': jh.id
          }
        },
        spec: {
          volumes: [
            {
              name: `vol-${RELEASE_NAME}-s3-conf`,
              secret: {
                secretName: `sec-${RELEASE_NAME}-s3-conf`
              }
            },
            {
              name: `vol-${RELEASE_NAME}-tf-conf`,
              secret: {
                secretName: `sec-${RELEASE_NAME}-tf-conf`
              }
            }
          ],
          containers: [
            {
              name: `tf-worker-${jh.id}`,
              image: k8sConf.K8S_TF_IMAGE,
              volumeMounts: [
                {
                  name: `vol-${RELEASE_NAME}-s3-conf`,
                  mountPath: '/run/secrets/s3',
                  readOnly: true
                },
                {
                  name: `vol-${RELEASE_NAME}-tf-conf`,
                  mountPath: '/run/secrets/tf',
                  readOnly: true
                }
              ],
              env: [
                {
                  name: 'JH_STATUS',
                  value: jh.status
                },
                {
                  name: 'JH_SLUG',
                  value: jh.slug
                },
                {
                  name: 'JH_IMAGE',
                  value: jh.containerImage
                },
                {
                  name: 'JH_INSTANCE_FLAVOUR',
                  value: jh.instanceFlavour
                },
                {
                  name: 'JH_INSTANCE_COUNT',
                  value: `${jh.instanceCount}`
                },
                {
                  name: 'JH_DESC',
                  value: jh.description
                },
                {
                  name: 'JH_CONTACT',
                  value: jh.creator.email
                }
              ]
            }
          ],
          restartPolicy: 'Never'
        }
      }
    }
  };
}
