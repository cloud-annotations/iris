FROM node:9.4.0-alpine
COPY server.js .
COPY package.json .
COPY client/build .
RUN npm install &&\
    apk update &&\
    apk upgrade
ENV PORT 8080
ENV NODE_ENV production
EXPOSE  8080
CMD node server.js
