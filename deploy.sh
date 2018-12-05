#!/bin/bash

export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/annotations/kube-config-wdc04-annotations.yml"

URL="https://annotations.us-east.containers.appdomain.cloud"

DEPLOYMENT="cloud-annotations-production"
PROJECT_ID="nypower"
NAME="annotate"
IMAGE_NAME="registry.ng.bluemix.net/$PROJECT_ID/$NAME:$(git rev-parse HEAD)"
CLUSTER="annotations"

function fail {
  echo $1 >&2
  exit 1
}

trap 'fail "The deployment was aborted. Message -- "' ERR

function configure {
  echo "Validating configuration..."
  [ ! -z "$DEPLOYMENT" ] || fail "Configuration option is not set: DEPLOYMENT"
  [ ! -z "$PROJECT_ID" ] || fail "Configuration option is not set: PROJECT_ID"
  [ ! -z "$IMAGE_NAME" ] || fail "Configuration option is not set: IMAGE_NAME"
}

function download_config {
  echo Downloading config for $CLUSTER ...
  ibmcloud cs cluster-config $CLUSTER
}

function attempt_build {
  echo Building $IMAGE_NAME ...
  ibmcloud cr build -t $IMAGE_NAME .
}

function set_image {
  echo Container build completed, updating $DEPLOYMENT ...
  # kubectl run $DEPLOYMENT --image=$IMAGE_NAME
  kubectl set image deployments/$DEPLOYMENT $DEPLOYMENT=$IMAGE_NAME
}

configure
download_config
attempt_build
set_image
echo "Deployment complete"
echo -e "\n$URL\n"

/usr/bin/open -a "/Applications/Google Chrome.app" $URL
