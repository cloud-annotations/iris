FROM node:10.15.0 as nodebuild
RUN git init
RUN git pull https://70a4a6e38697b65ad9bdabd9ff6e58183e2c59a9@github.com/bourdakos1/cloud-annotations-client.git
# RUN git clone https://06b12b9f52779d900470586ae84e93e8a5f3d70a:@github.com/bourdakos1/cloud-annotations-client.git
RUN npm install
RUN cd client && npm install && npm run build
 
FROM scratch
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


# FROM node:10.15.0-alpine
# COPY server.js .
# COPY package.json .
# COPY client/build client
# RUN npm install &&\
#     apk update &&\
#     apk upgrade
# ENV PORT 8080
# ENV NODE_ENV production
# EXPOSE  8080
# CMD node server.js
