import k8s from '@kubernetes/client-node';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';

// TODO: use S3 instead of volume
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
      }
    }
  };
}
