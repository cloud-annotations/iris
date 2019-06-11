FROM node:10.15.0 as nodebuild
RUN git init
RUN git pull https://70a4a6e38697b65ad9bdabd9ff6e58183e2c59a9@github.com/bourdakos1/cloud-annotations-client.git
RUN npm install
RUN cd client && npm install && npm run build
 
FROM node:10.15.0-alpine
COPY --from=nodebuild server.js .
COPY --from=nodebuild package.json .
COPY --from=nodebuild client/build client
RUN npm install &&\
    apk update &&\
    apk upgrade
ENV PORT 8080
ENV NODE_ENV production
EXPOSE  8080
CMD node server.js