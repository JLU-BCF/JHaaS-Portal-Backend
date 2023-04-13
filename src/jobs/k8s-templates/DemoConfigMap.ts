import k8s from '@kubernetes/client-node';

// TODO: use S3 instead of volume
export function getDemoConfigMap(data: { [key: string]: string }): k8s.V1ConfigMap {
  const time = new Date().getTime();
  return {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      creationTimestamp: null,
      name: `demo-config-${time}`
    },
    data: data
  };
}
