FROM node:12.18.4

WORKDIR /iris

COPY iris .

RUN npm install -g .

RUN git clone https://github.com/cloud-annotations/iris.git /usr/local/.iris

WORKDIR /usr/local/.iris

RUN git checkout helm

RUN yarn install
RUN make build

ENV SPA_ROOT=/usr/local/.iris/packages/iris-app/build

ENTRYPOINT [ "iris" ]
CMD [ "dev" ]