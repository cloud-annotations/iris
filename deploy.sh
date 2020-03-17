#!/bin/bash

trap 'echo "The deployment was aborted. Message -- "; exit 1' ERR

CLUSTER="bpnvi8vw0nkktonrr20g"
IMAGE_NAME="us.icr.io/cloud-annotations/frontend:stage2"

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
sed -i "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s/frontend.yaml
kubectl apply -f k8s

echo "Deployment complete"
