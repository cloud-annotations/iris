#!/bin/bash

if [ "$DEPLOY_TO" = "production" ]
then
  # PRODUCTION:
  echo "Deploying to PRODUCTION..."
  export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/annotations/kube-config-wdc04-annotations.yml"
  CLUSTER="annotations"
  URL="https://${CLUSTER}.us-east.containers.appdomain.cloud"
  DEPLOYMENT="cloud-annotations-production"
else
  # STAGING:
  echo "Deploying to STAGING..."
  export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/staging.annotations/kube-config-wdc04-staging.annotations.yml"
  CLUSTER="staging.annotations"
  URL="https://stagingannotations.us-east.containers.appdomain.cloud"
  DEPLOYMENT="cloud-annotations-staging"
fi


PROJECT_ID="bourdakos1"
NAME="annotate"
IMAGE_NAME="us.icr.io/${PROJECT_ID}/${NAME}:$(git rev-parse HEAD)"

function fail {
  echo $1 >&2
  exit 1
}

trap 'fail "The deployment was aborted. Message -- "' ERR

function configure {
  echo "Validating configuration..."
  [ ! -z "$CLUSTER" ] || fail "Configuration option is not set: CLUSTER"
  [ ! -z "$DEPLOYMENT" ] || fail "Configuration option is not set: DEPLOYMENT"
  [ ! -z "$PROJECT_ID" ] || fail "Configuration option is not set: PROJECT_ID"
  [ ! -z "$IMAGE_NAME" ] || fail "Configuration option is not set: IMAGE_NAME"
  # ibmcloud login -sso
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
  # kubectl run $DEPLOYMENT --image=$IMAGE_NAME # Must only be run if this is a new DEPLOYMENT
  kubectl set image deployments/$DEPLOYMENT $DEPLOYMENT=$IMAGE_NAME
  kubectl scale deployment $DEPLOYMENT --replicas=6
}

configure
download_config
attempt_build
set_image
echo "Deployment complete"
echo -e "\n$URL\n"

/usr/bin/open -a "/Applications/Google Chrome.app" $URL
