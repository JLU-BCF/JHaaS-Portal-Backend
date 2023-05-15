import k8s from '@kubernetes/client-node';
import * as k8sConf from '../../config/K8s';
import { RELEASE_NAME } from '../../config/Config';

export function getDemoWorkerJob(): k8s.V1Job {
  return {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata: {
      creationTimestamp: null,
      name: 'tf-worker-demo',
      namespace: k8sConf.K8S_TF_NS,
      labels: {
        'jupyter-hub-request': 'demo'
      }
    },
    spec: {
      selector: {
        matchLabels: {
          'jupyter-hub-request': 'demo'
        }
      },
      template: {
        metadata: {
          labels: {
            'jupyter-hub-request': 'demo'
          }
        },
        spec: {
          volumes: [
            {
              name: `vol-${RELEASE_NAME}-projected-secrets`,
              projected: {
                sources: [
                  {
                    secret: {
                      name: `vol-${RELEASE_NAME}-s3-conf`,
                      items: [
                        {
                          key: 'minio.secret',
                          path: 'minio.secret'
                        }
                      ]
                    }
                  },
                  {
                    secret: {
                      name: `sec-${RELEASE_NAME}-tf-conf`,
                      items: [
                        {
                          key: 'terraform.secret',
                          path: 'terraform.secret'
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ],
          containers: [
            {
              name: 'tf-worker-demo',
              image: k8sConf.K8S_TF_IMAGE,
              volumeMounts: [
                {
                  name: `vol-${RELEASE_NAME}-projected-secrets`,
                  mountPath: '/secrets',
                  readOnly: true
                }
              ],
              env: [
                {
                  name: 'SECRETS_PATH',
                  value: '/secrets'
                },
                {
                  name: 'JH_STATUS',
                  value: 'demo-status'
                },
                {
                  name: 'JH_SLUG',
                  value: 'demo-slug'
                },
                {
                  name: 'JH_IMAGE',
                  value: 'demo-containerimage'
                },
                {
                  name: 'JH_INSTANCE_FLAVOUR',
                  value: 'demo-instanceflavour'
                },
                {
                  name: 'JH_INSTANCE_COUNT',
                  value: 'demo-instancecount'
                },
                {
                  name: 'JH_DESC',
                  value: 'demo-desc'
                },
                {
                  name: 'JH_CONTACT',
                  value: 'demo-contact'
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
