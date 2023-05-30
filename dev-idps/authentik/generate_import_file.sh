#!/bin/sh

echo 'entries:' > import_me.yaml
cat $(cat apply_order.txt | tr '\n' ' ') >> import_me.yaml

POST_AUTH_CALLBACK_URL=${POST_AUTH_CALLBACK_URL:-'http://localhost:3000/api/auth/oidc/cb'}
POST_LOGOUT_URL=${POST_LOGOUT_URL:-'http://localhost:3000/user/logout'}
AUTHENTICATION_FLOW_URL=${AUTHENTICATION_FLOW_URL:-'http://authentik:9000/if/flow/jhaas-authentication'}

sed -i "s|__POST_AUTH_CALLBACK_URL__|${POST_AUTH_CALLBACK_URL}|g" import_me.yaml
sed -i "s|__POST_LOGOUT_URL__|${POST_LOGOUT_URL}|g" import_me.yaml
sed -i "s|__AUTHENTICATION_FLOW_URL__|${AUTHENTICATION_FLOW_URL}|g" import_me.yaml
