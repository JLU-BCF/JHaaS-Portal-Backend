ARG NODE_TAG="20"
ARG NODE_TAG_PROD="20-alpine"

FROM node:${NODE_TAG} as develop

ARG USER='1000:1000'
ARG CACHEDIR=/jhaas-cache
ARG APPDIR=/jhaas-app

RUN usermod -u ${USER%:*} -g ${USER#*:} -m -d ${CACHEDIR} node
RUN mkdir -p ${APPDIR} && chown -R ${USER} ${APPDIR}

COPY docker-entrypoint-dev.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER ${USER}
VOLUME ${CACHEDIR}
VOLUME ${APPDIR}
WORKDIR ${APPDIR}

ENTRYPOINT ["/entrypoint.sh"]

FROM node:${NODE_TAG} AS build

ARG APPDIR=/jhaas-app

WORKDIR ${APPDIR}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:${NODE_TAG_PROD} AS production

ARG APPDIR=/jhaas-app
WORKDIR ${APPDIR}

COPY --from=build ${APPDIR}/package*.json ./
RUN npm ci --production && rm package*.json

COPY --from=build ${APPDIR}/dist/ ./dist/
COPY templates/ ./templates/

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["./dist/server.js"]
