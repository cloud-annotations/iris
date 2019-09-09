#!/bin/bash

# export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/annotations/kube-config-wdc04-annotations.yml"
# export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/staging.annotations/kube-config-wdc04-staging.annotations.yml"

# Remove node modules so docker context is smaller.
rm -rf node_modules
rm -rf client/node_modules

if [ "$DEPLOY_TO" = "production" ]
then
  # PRODUCTION:
  echo "Deploying to PRODUCTION..."
  CLUSTER="annotations"
  URL="https://${CLUSTER}.us-east.containers.appdomain.cloud"
else
  # STAGING:
  echo "Deploying to STAGING..."
  CLUSTER="staging.annotations"
  URL="https://stagingannotations.us-east.containers.appdomain.cloud"
fi

IMAGE_NAME="us.icr.io/bourdakos1/annotate:$(git rev-parse HEAD)"

function fail {
  echo $1 >&2
  exit 1
}

trap 'fail "The deployment was aborted. Message -- "' ERR

function configure {
  echo "Validating configuration..."
  [ ! -z "$CLUSTER" ] || fail "Configuration option is not set: CLUSTER"
  [ ! -z "$IMAGE_NAME" ] || fail "Configuration option is not set: IMAGE_NAME"
  
  ibmcloud config --check-version=false
  ibmcloud login -r us-east
}

function download_config {
  echo Downloading config for $CLUSTER ...
  CONFIG="$(ibmcloud ks cluster-config $CLUSTER)"
  CONFIG=${CONFIG##*export KUBECONFIG=}
  CONFIG=${CONFIG%%.yml*}
  export KUBECONFIG=$CONFIG.yml
}

function attempt_build {
  echo Building $IMAGE_NAME ...
  ibmcloud cr build  --no-cache --pull --build-arg CLIENT_ID=$CLIENT_ID --build-arg CLIENT_SECRET=$CLIENT_SECRET -t $IMAGE_NAME .
}

function set_image {
  echo Container build completed, updating $DEPLOYMENT ...
  sed -i '' "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s/frontend.yaml
  kubectl apply -f k8s
}

configure
download_config
attempt_build
set_image
echo "Deployment complete"
