import k8s from '@kubernetes/client-node';

// TODO: use S3 instead of volume
export function getDemoWorkerJob(echo: string): k8s.V1Job {
  const time = new Date().getTime();
  return {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata: {
      creationTimestamp: null,
      name: `demo-job-${time}`
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: `demo-helloworld-job-${time}`,
              image: 'docker.io/library/hello-world:latest',
              env: [
                {
                  name: 'ECHO_DATA',
                  value: echo
                }
              ]
            },
            {
              name: `demo-echo-job-${time}`,
              image: 'docker.io/library/busybox:latest',
              env: [
                {
                  name: 'ECHO_DATA',
                  value: echo
                }
              ],
              command: ['/bin/echo', '$ECHO_DATA']
            }
          ],
          restartPolicy: 'Never'
        }
      }
    }
  };
}
