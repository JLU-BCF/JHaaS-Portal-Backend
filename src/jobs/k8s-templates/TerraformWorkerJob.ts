import k8s from '@kubernetes/client-node';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';
import { RELEASE_NAME } from '../../config/Config';

export function getTerraformWorkerJob(jh: JupyterHubRequest, action: string): k8s.V1Job {
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
          imagePullSecrets: [
            {
              name: `sec-${RELEASE_NAME}-registry-credentials`
            }
          ],
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
            },
            {
              name: `vol-${RELEASE_NAME}-cloud-kubeconfig`,
              secret: {
                secretName: `sec-${RELEASE_NAME}-cloud-kubeconfig`
              }
            }
          ],
          containers: [
            {
              name: 'tf-worker',
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
                },
                {
                  name: `vol-${RELEASE_NAME}-cloud-kubeconfig`,
                  mountPath: '/run/secrets/kubeconfig',
                  readOnly: true
                }
              ],
              env: [
                {
                  name: 'JH_ACTION',
                  value: action
                },
                {
                  name: 'JH_ID',
                  value: jh.id
                },
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
                },
                {
                  name: 'JHAAS_DOMAIN',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_DOMAIN',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'JHAAS_ISSUER',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_ISSUER',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'JHAAS_AUTHENTIK_URL',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_AUTHENTIK_URL',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'JHAAS_AUTHENTIK_TOKEN',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_AUTHENTIK_TOKEN',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'JHAAS_AUTHENTICATION_FLOW',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_AUTHENTICATION_FLOW',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'JHAAS_AUTHORIZATION_FLOW',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_AUTHORIZATION_FLOW',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'SECRETS_PATH',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'SECRETS_PATH',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'S3_CONF',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'S3_CONF',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'TF_CONF',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'TF_CONF',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
                },
                {
                  name: 'KUBECONFIG',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'KUBECONFIG',
                      name: `env-${RELEASE_NAME}-tf-conf`
                    }
                  }
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
