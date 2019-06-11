#!/bin/bash

# export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/annotations/kube-config-wdc04-annotations.yml"
# export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/staging.annotations/kube-config-wdc04-staging.annotations.yml"

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
  
  ACCOUNT_ID="$(ibmcloud account show)"
  if [[ $ACCOUNT_ID != *"47b84451ab70b94737518f7640a9ee42"* ]]; then
    ibmcloud login -sso
  fi
}

function download_config {
  echo Downloading config for $CLUSTER ...
  CONFIG="$(ibmcloud cs cluster-config $CLUSTER)"
  CONFIG=${CONFIG##*export KUBECONFIG=}
  CONFIG=${CONFIG%%.yml*}
  export KUBECONFIG=$CONFIG.yml
}

function attempt_build {
  echo Building $IMAGE_NAME ...
  ibmcloud cr build -t $IMAGE_NAME .
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
echo -e "\n$URL\n"

/usr/bin/open -a "/Applications/Google Chrome.app" $URL
