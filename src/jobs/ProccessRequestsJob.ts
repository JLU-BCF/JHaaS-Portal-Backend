import { S3_JH_SPECS_BUCKET, minioClient } from '../config/S3';
import { destroyJupyterGroup } from '../helpers/AuthentikApiHelper';
import { streamToString } from '../helpers/S3Helper';
import { MailHelper } from '../mail/MailHelper';
import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import { init } from './helpers/DatabaseHelper';
import k8sHelper from './helpers/K8sHelper';

export function processRequests(): void {
  JupyterHubRequestRepository.findProgressingJupyterHubRequests()
  .then(([requests, count]) => {
    console.log(`Found ${count} requests in progress`);
    for (const request of requests) {
      checkProgress(request);
    }
  })
  .catch((err: unknown) => {
    console.log(err);
    throw err;
  });

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
  console.log(`${request.slug} : going to deploy.`);
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
  console.log(`${request.slug} : going to degrade.`);
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

function checkProgress(request: JupyterHubRequest) {
  minioClient.bucketExists(S3_JH_SPECS_BUCKET, (err, exist) => {
    if (err) {
      return console.error(err);
    }
    if (exist) {
      minioClient.getObject(
        S3_JH_SPECS_BUCKET,
        `${request.id}/JupyterHubRequestStatus`,
        (err, stream) => {
          if (err) {
            return console.log(err);
          }

          streamToString(stream)
            .then((status) => {
              switch (status) {
                case 'DEPLOYING':
                case 'DEGRADING':
                  console.log(`${request.slug} : still in progress, nothing to do.`);
                  break;
                case 'DEPLOYED':
                  setJupyterHubRequestDeployed(request);
                  break;
                case 'DEGRATED':
                  setJupyterHubRequestDegrated(request);
                  break;
                case 'FAILED':
                  setJupyterHubRequestFailed(request);
                  break;
                default:
                  console.error(`${request.slug} : could not determine status!`);
              }
            })
            .catch((err) => {
              return console.log(err);
            });
        }
      );
    } else {
      console.log(`${request.slug} : could not find existent bucket.`);
    }
  });
}

function setJupyterHubRequestDeployed(request: JupyterHubRequest) {
  console.log(`${request.slug} : successfully deployed.`);
  console.log(`${request.slug} : try getting deployment URL.`);

  minioClient.getObject(S3_JH_SPECS_BUCKET, `${request.id}/JupyterHubUrl`, (err, stream) => {
    if (err) {
      return console.log(err);
    }
    streamToString(stream)
      .then((url) => {
        request.status = JupyterHubRequestStatus.DEPLOYED;
        request.hubUrl = url;
        JupyterHubRequestRepository.updateOne(request)
          .then((requestInstance) => {
            MailHelper.sendJupyterDeployed(requestInstance);
          })
          .catch((err: unknown) => {
            return console.log(err);
          });
      })
      .catch((err) => {
        return console.log(err);
      });
  });
}

function setJupyterHubRequestDegrated(request: JupyterHubRequest) {
  console.log(`${request.slug} : successfully degrated.`);
  request.status = JupyterHubRequestStatus.DEGRATED;
  JupyterHubRequestRepository.updateOne(request)
    .then((requestInstance) => {
      if (requestInstance.authentikGroup) {
        destroyJupyterGroup(requestInstance.authentikGroup);
      }
      MailHelper.sendJupyterDegrated(requestInstance);
    })
    .catch((err: unknown) => {
      console.log(err);
      throw err;
    });
}

function setJupyterHubRequestFailed(request: JupyterHubRequest) {
  console.log(`${request.slug} : deployment or degration failed.`);
  request.status = JupyterHubRequestStatus.FAILED;
  JupyterHubRequestRepository.updateOne(request)
    .then((requestInstance) => {
      MailHelper.sendJupyterFailed(requestInstance);
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
