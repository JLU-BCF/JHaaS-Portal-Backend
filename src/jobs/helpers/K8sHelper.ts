import {
  KubeConfig,
  CoreV1Api,
  AppsV1Api,
  BatchV1Api,
  CustomObjectsApi
} from '@kubernetes/client-node';
import { getTerraformWorkerJob } from '../k8s-templates/TerraformWorkerJob';
import { JupyterHubRequest } from '../../models/JupyterHubRequest';
import { K8S_KC_NS, K8S_TF_NS } from '../../config/K8s';
import { getRealmImportOperatorJob } from '../k8s-templates/RealmOperatorJob';

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

  public deployTerraFormWorkerJob(jh: JupyterHubRequest) {
    const jobDefinition = getTerraformWorkerJob(jh);
    this.batchK8sApi
      .createNamespacedJob(K8S_TF_NS, jobDefinition)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }

  public deployRealmImportOperatorJob(jh: JupyterHubRequest) {
    const jobDefinition = getRealmImportOperatorJob(jh);
    this.customK8sApi
      .createNamespacedCustomObject(
        'k8s.keycloak.org',
        'v2alpha1',
        K8S_KC_NS,
        'keycloakrealmimports',
        jobDefinition
      )
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
