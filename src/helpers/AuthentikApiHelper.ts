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
        return data['results'][0]['pk'];
      }
      return null;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function createJupyterGroup(slug: string): Promise<string | null> {
  const parent_id = await getJupyterParentGroup();
  return axios
    .post(
      `${url}/core/groups/`,
      {
        name: `jh_${slug}`,
        is_superuser: false,
        parent: parent_id
      },
      { headers }
    )
    .then(({ data }) => {
      return data['pk'];
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function assignUserToGroup(user_id: string, group_uuid: string) {
  return axios
    .post(
      `${url}/core/groups/${group_uuid}/add_user/`,
      {
        pk: user_id
      },
      { headers }
    )
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}
