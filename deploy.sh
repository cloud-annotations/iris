#!/bin/bash

trap 'echo "The deployment was aborted. Message -- "; exit 1' ERR

CLUSTER="bpnvi8vw0nkktonrr20g"
IMAGE_NAME="us.icr.io/cloud-annotations/frontend:$(git rev-parse HEAD)"

# Log in
echo "Logging in..."
ibmcloud config --check-version=false
ibmcloud login -a cloud.ibm.com -r us-east -g prod

# Download cluster config
echo Downloading config for $CLUSTER ...
eval $(ibmcloud ks cluster config --cluster $CLUSTER | grep "export KUBECONFIG")

# Build image
echo Building $IMAGE_NAME ...
ibmcloud cr build --no-cache --pull --build-arg CLIENT_ID=$CLIENT_ID --build-arg CLIENT_SECRET=$CLIENT_SECRET -t $IMAGE_NAME .

# Apply kubernetes yamls
echo Container build completed, updating $DEPLOYMENT ...
sed -i "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s-base/frontend.yaml

if [ "$DEPLOY_TO" = "production" ]
then
  # PRODUCTION:
  kubectl apply -f k8s-base -n prod
  kubectl apply -f k8s-prod -n prod
else
  # STAGING:
  kubectl apply -f k8s-base -n stage
  kubectl apply -f k8s-stage -n stage
fi

echo "Deployment complete"
