############################
# Stage 1
############################
# @sha256:3d5b19ec04fd3600df7fe014c7301a53a5437c9677c27baeee4247b6a1670ed3
FROM node:12.18.4-slim as ui-builder

# Build the UI
COPY src/client .
RUN yarn && yarn build


############################
# Stage 2
############################
FROM node:12.18.4-slim

# Install packages
COPY src/package.json src/yarn.lock ./
RUN yarn install --only=production

# Copy in source files
COPY --from=ui-builder build client
COPY src/server.js ./

# Set server env
ENV PORT 8080
ENV NODE_ENV production

EXPOSE  8080
CMD node server.js