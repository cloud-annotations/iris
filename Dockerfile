FROM node:10.15.0-alpine
COPY server.js .
COPY package.json .
COPY client/build client
RUN npm install &&\
    apk update &&\
    apk upgrade
ENV PORT 8080
ENV NODE_ENV production
ENV REDIS_HOST redis.default.svc.cluster.local
EXPOSE  8080
CMD node server.js
