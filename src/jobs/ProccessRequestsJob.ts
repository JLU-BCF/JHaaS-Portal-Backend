import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import { init } from './helpers/DatabaseHelper';
import k8sHelper from './helpers/K8sHelper';

export function processRequests(): void {
  JupyterHubRequestRepository.findDeployableJupyterHubRequests()
    .then(([requests, count]) => {
      console.log(`Found ${count} deployable requests`);
      for (const request of requests) {
        deployOneRequest(request);
      }
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });

  JupyterHubRequestRepository.findDegradableJupyterHubRequests()
    .then(([requests, count]) => {
      console.log(`Found ${count} degradable requests`);
      for (const request of requests) {
        degradeOneRequest(request);
      }
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });
}

function deployOneRequest(request: JupyterHubRequest) {
  request.status = JupyterHubRequestStatus.DEPLOYING;
  JupyterHubRequestRepository.updateOne(request)
    .then((requestInstance) => {
      k8sHelper.deployTerraFormWorkerJob(requestInstance, 'DEPLOY');
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });
}

function degradeOneRequest(request: JupyterHubRequest) {
  request.status = JupyterHubRequestStatus.DEGRADING;
  JupyterHubRequestRepository.updateOne(request)
    .then((requestInstance) => {
      k8sHelper.deployTerraFormWorkerJob(requestInstance, 'DEGRADE');
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
