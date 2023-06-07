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
        'jupyter-hub-request': jh.id,
        'jupyter-hub-action': action
      }
    },
    spec: {
      ttlSecondsAfterFinished: 300,
      template: {
        metadata: {
          labels: {
            'jupyter-hub-request': jh.id,
            'jupyter-hub-action': action
          }
        },
        spec: {
          restartPolicy: 'Never',
          imagePullSecrets: [
            {
              name: `sec-${RELEASE_NAME}-registry-credentials`
            }
          ],
          volumes: [
            {
              name: `vol-${RELEASE_NAME}-projected-secrets`,
              projected: {
                sources: [
                  {
                    secret: {
                      name: `sec-${RELEASE_NAME}-s3-conf`,
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
                  },
                  {
                    secret: {
                      name: `sec-${RELEASE_NAME}-cloud-kubeconfig`,
                      items: [
                        {
                          key: 'kubeconfig.secret',
                          path: 'kubeconfig.secret'
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
              name: 'tf-worker',
              image: k8sConf.K8S_TF_IMAGE,
              imagePullPolicy: 'Always',
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
                  name: 'S3_CONF',
                  value: 'minio.secret'
                },
                {
                  name: 'TF_CONF',
                  value: 'terraform.secret'
                },
                {
                  name: 'KUBECONFIG',
                  value: 'kubeconfig.secret'
                },
                {
                  name: 'JH_ACTION',
                  value: action
                },
                {
                  name: 'JH_ID',
                  value: jh.id
                },
                {
                  name: 'JH_NAME',
                  value: jh.name
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
                  name: 'JH_GROUP_ID',
                  value: jh.authentikGroup
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
                }
              ]
            }
          ]
        }
      }
    }
  };
}
