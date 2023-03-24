FROM node:16 as develop

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

FROM node:16 AS build

ARG APPDIR=/jhaas-app

WORKDIR ${APPDIR}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:16-alpine AS production

ARG APPDIR=/jhaas-app

WORKDIR ${APPDIR}
COPY --from=build ${APPDIR}/package*.json ./

RUN npm ci --production
COPY --from=build ${APPDIR}/dist/ ./dist/

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["./dist/server.js"]
