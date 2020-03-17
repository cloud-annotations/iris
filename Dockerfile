FROM node:10.15.0 as nodebuild
COPY src .
RUN npm install && cd client && npm install && npm run build
 
FROM node:10.15.0-alpine
COPY --from=nodebuild server.js .
COPY --from=nodebuild package.json .
COPY --from=nodebuild package-lock.json .
COPY --from=nodebuild client/build client

RUN npm install --only=production &&\
    apk update &&\
    apk upgrade
ENV PORT 8080
ENV NODE_ENV production

ARG CLIENT_ID
ENV CLIENT_ID $CLIENT_ID

ARG CLIENT_SECRET
ENV CLIENT_SECRET $CLIENT_SECRET

EXPOSE  8080
CMD node server.js