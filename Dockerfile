FROM node:12.18.4

WORKDIR /iris

COPY cli .

RUN npm install -g . --unsafe-perm

ENTRYPOINT [ "iris" ]
CMD [ "dev" ]