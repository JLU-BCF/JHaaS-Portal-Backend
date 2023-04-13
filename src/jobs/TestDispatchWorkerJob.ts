import { KubeConfig, CoreV1Api, BatchV1Api } from '@kubernetes/client-node';
import { getDemoConfigMap } from './k8s-templates/DemoConfigMap';
import { getDemoWorkerJob } from './k8s-templates/DemoWorkerJob';

class DemoJobDispatcher {
  private kc: KubeConfig;
  private coreK8sApi: CoreV1Api;
  private batchK8sApi: BatchV1Api;
  private namespace: string;

  constructor(namespace: string) {
    this.kc = new KubeConfig();
    this.kc.loadFromDefault();
    this.coreK8sApi = this.kc.makeApiClient(CoreV1Api);
    this.batchK8sApi = this.kc.makeApiClient(BatchV1Api);
    this.namespace = namespace;
  }

  async createDemoJob() {
    const demoWorkerJob = getDemoWorkerJob('!!! yeah !!!');

    return this.batchK8sApi
      .createNamespacedJob(this.namespace, demoWorkerJob)
      .then(() => {
        console.log('done');
      })
      .catch((err) => console.log(err));
  }

  async createDemoConfig() {
    const demoConfigMap = getDemoConfigMap({
      hello: 'world',
      foo: 'bar'
    });

    return this.coreK8sApi
      .createNamespacedConfigMap(this.namespace, demoConfigMap)
      .then(() => {
        console.log('created config map.');
      })
      .catch((err) => console.log(err));
  }

  public runDemo() {
    this.createDemoConfig().then(() => {
      this.createDemoJob();
    });
  }
}

const demoJob = new DemoJobDispatcher('jhaas-portal-playground');
demoJob.runDemo();
