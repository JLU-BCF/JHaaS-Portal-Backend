import axios, { AxiosHeaders } from 'axios';

export default class JupyterHubApiHelper {
  private url: string;
  private apiToken: string;
  private headers: AxiosHeaders;

  constructor(url: string, apiToken: string) {
    this.url = url.replace(/\/$/, '');
    this.apiToken = apiToken;

    this.headers = new AxiosHeaders({
      accept: 'application/json',
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/json'
    });
  }

  public async getHubVersion() {
    return axios
      .get(`${this.url}/hub/api/`, {
        headers: this.headers
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async getHubInfo() {
    return axios
      .get(`${this.url}/hub/api/info`, {
        headers: this.headers
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async deleteUser(userId: string) {
    return axios
      .delete(`${this.url}/hub/api/users/${userId}`, {
        headers: this.headers
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async stopUserServer(userId: string) {
    return axios
      .delete(`${this.url}/hub/api/users/${userId}/server`, {
        headers: this.headers
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async stopAllServers(userId: string) {
    return axios
      .delete(`${this.url}/hub/api/users/${userId}/server`, {
        headers: this.headers
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
