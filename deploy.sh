#!/bin/bash

trap 'echo "The deployment was aborted. Message -- "; exit 1' ERR

# Log in
echo "Logging in..."
ibmcloud config --check-version=false
ibmcloud login -a cloud.ibm.com -r us-east -g prod

# Download cluster config
echo Downloading config for $CLUSTER_ID ...
ibmcloud ks cluster config --cluster $CLUSTER_ID

# Build image
echo Building $IMAGE_NAME ...
ibmcloud cr login
docker build --build-arg CLIENT_ID=$CLIENT_ID --build-arg CLIENT_SECRET=$CLIENT_SECRET -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Apply kubernetes yamls
echo Container build completed, updating $DEPLOYMENT ...
sed -i "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s-base/frontend.yaml

if [ "$DEPLOY_TO" = "production" ]
then
  # PRODUCTION:
  kubectl apply -f k8s-base
  kubectl apply -f k8s-prod
else
  # STAGING:
  kubectl apply -f k8s-base -n stage
  kubectl apply -f k8s-stage -n stage
fi

echo "Deployment complete"
