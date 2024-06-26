import {
  KubeConfig,
  CoreV1Api,
  AppsV1Api,
  BatchV1Api,
  CustomObjectsApi
} from '@kubernetes/client-node';
import { getTerraformWorkerJob } from '../k8s-templates/TerraformWorkerJob';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import { K8S_TF_NS } from '../../config/K8s';
import JupyterHubSecrets from '../../models/JupyterHubSecrets';

class K8sHelper {
  private kc: KubeConfig;
  private k8sApi: AppsV1Api;
  private coreK8sApi: CoreV1Api;
  private batchK8sApi: BatchV1Api;
  private customK8sApi: CustomObjectsApi;

  constructor() {
    this.kc = new KubeConfig();
    this.kc.loadFromCluster();
    this.k8sApi = this.kc.makeApiClient(AppsV1Api);
    this.coreK8sApi = this.kc.makeApiClient(CoreV1Api);
    this.batchK8sApi = this.kc.makeApiClient(BatchV1Api);
    this.customK8sApi = this.kc.makeApiClient(CustomObjectsApi);
  }

  public async deployTerraFormWorkerJob(jh: JupyterHubRequest, action: string) {
    if (!jh.secrets) {
      jh.secrets = new JupyterHubSecrets(true);
    }

    const jobDefinition = getTerraformWorkerJob(jh, action);
    this.batchK8sApi
      .createNamespacedJob({
        namespace: K8S_TF_NS,
        body: jobDefinition
      })
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }
}

export default new K8sHelper();
