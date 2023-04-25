import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import { init } from './helpers/DatabaseHelper';
import k8sHelper from './helpers/K8sHelper';

export function processRequests(): void {
  JupyterHubRequestRepository.findDeployableJupyterHubRequests()
    .then(([requests, count]) => {
      console.log(`Found ${count} processable requests`);
      for (const request of requests) {
        proccessOneRequest(request);
      }
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });
}

function proccessOneRequest(request: JupyterHubRequest) {
  request.status = JupyterHubRequestStatus.DEPLOYING;
  JupyterHubRequestRepository.updateOne(request)
    .then((requestInstance) => {
      k8sHelper.deployTerraFormWorkerJob(requestInstance);
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });
}

init().then(() => processRequests());

/**
 * npm run job ./src/jobs/ProccessRequestsJob.ts
 */
