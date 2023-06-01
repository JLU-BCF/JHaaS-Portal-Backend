import axios from 'axios';

import {
  AUTHENTIK_API_ENDPOINT as url,
  AUTHENTIK_API_SECRET as api_secret,
  AUTHENTIK_JH_GROUP_NAME as jupyter_group_name
} from '../config/Oidc';

const headers = {
  accept: 'application/json',
  authorization: `Bearer ${api_secret}`,
  'content-type': 'application/json'
};

async function getJupyterParentGroup(): Promise<string | null> {
  return axios
    .get(`${url}/core/groups/`, {
      headers,
      params: {
        name: jupyter_group_name
      }
    })
    .then(({ data }) => {
      if (data['results'] && Array.isArray(data['results']) && data['results'].length == 1) {
        console.log(data['results'][0]['pk']);
        return data['results'][0]['pk'];
      }
      return null;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function createJupyterGroup(id: string) {
  const parent_id = await getJupyterParentGroup();
  axios
    .post(
      `${url}/core/groups/`,
      {
        name: id,
        is_superuser: false,
        parent: parent_id
      },
      { headers }
    )
    .then(({ data }) => {
      console.log(data['pk']);
      return data['pk'];
    })
    .catch(console.error);
}