import axios, { AxiosHeaders } from 'axios';

export default class JupyterHubApiHelper {
  private url: string;
  private headers: AxiosHeaders;

  constructor(url: string, apiToken: string) {
    this.url = url.replace(/\/$/, '');

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
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        return Promise.reject(err);
      });
  }

  public async getHubInfo() {
    return axios
      .get(`${this.url}/hub/api/info`, {
        headers: this.headers
      })
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        return Promise.reject(err);
      });
  }

  public async getUsers() {
    return axios
      .get(`${this.url}/hub/api/users`, {
        headers: this.headers
      })
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        return Promise.reject(err);
      });
  }

  public async deleteUser(userId: string) {
    return axios
      .delete(`${this.url}/hub/api/users/${userId}`, {
        headers: this.headers
      })
      .then(() => true)
      .catch((err) => {
        if (err.response && err.response.status == 404) {
          // User was never signed into hub, that's ok.
          return true;
        }
        console.log(err);
        return false;
      });
  }

  public async startUserServer(userId: string) {
    console.log('going to start notebook for:', userId);
    return axios
      .post(`${this.url}/hub/api/users/${userId}/server`, {
        headers: this.headers
      })
      .then(() => true)
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  public async stopUserServer(userId: string) {
    return axios
      .delete(`${this.url}/hub/api/users/${userId}/server`, {
        headers: this.headers
      })
      .then(() => true)
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  public async stopAllServers() {
    const failures = [];
    return this.getUsers()
      .then((users) => {
        users.forEach(async (user) => {
          try {
            await this.stopUserServer(user.name);
          } catch (err) {
            failures.push({ user: user.name, err });
          }
        });
        return failures;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }
}
