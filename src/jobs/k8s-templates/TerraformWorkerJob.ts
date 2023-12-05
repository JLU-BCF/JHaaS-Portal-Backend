import k8s from '@kubernetes/client-node';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import * as k8sConf from '../../config/K8s';
import { RELEASE_NAME } from '../../config/Config';
import { S3_TF_STATE_BUCKET, S3_JH_SPECS_BUCKET } from '../../config/S3';

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
              imagePullPolicy: k8sConf.K8S_TF_IMAGE_PP,
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
                  name: 'JH_ADMIN_ID',
                  value: jh.creator.externalId
                },
                {
                  name: 'JH_API_TOKEN',
                  value: jh.secrets.apiToken
                },
                {
                  name: 'JH_IMAGE',
                  value: jh.containerImage
                },
                {
                  name: 'JH_NB_DEFAULT_URL',
                  value: jh.notebookDefaultUrl
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
                  name: 'NB_RAM_GUARANTEE',
                  value: `${jh.getNbRamGuarantee()}G`
                },
                {
                  name: 'NB_CPU_GUARANTEE',
                  value: `${jh.getNbCpuGuarantee()}`
                },
                {
                  name: 'NB_RAM_LIMIT',
                  value: `${jh.getNbRamLimit()}G`
                },
                {
                  name: 'NB_CPU_LIMIT',
                  value: `${jh.getNbCpuLimit()}`
                },
                {
                  name: 'NB_COUNT_LIMIT',
                  value: `${jh.getNbCountLimit()}`
                },
                {
                  name: 'NB_HOME_SIZE',
                  value: `${jh.getNbHomeSize()}G`
                },
                {
                  name: 'NB_HOME_MOUNT_PATH',
                  value: jh.getNbHomeMountPath()
                },
                {
                  name: 'NS_RAM_LIMIT',
                  value: `${jh.getNsRamLimit()}G`
                },
                {
                  name: 'NS_CPU_LIMIT',
                  value: `${jh.getNsCpuLimit()}`
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
                  name: 'JHAAS_ICON',
                  valueFrom: {
                    configMapKeyRef: {
                      key: 'JHAAS_ICON',
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
                  name: 'S3_TF_STATE_BUCKET',
                  value: S3_TF_STATE_BUCKET
                },
                {
                  name: 'S3_JH_SPECS_BUCKET',
                  value: S3_JH_SPECS_BUCKET
                }
              ]
            }
          ]
        }
      }
    }
  };
}
