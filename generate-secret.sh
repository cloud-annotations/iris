# sudo certbot certonly --manual --preferred-challenges=dns
# *.annotations.ai, annotations.ai
# nslookup -type=TXT _acme-challenge.annotations.ai

# run this script, then:
# ./generate-secret.sh 

# ibmcloud api https://cloud.ibm.com
# ibmcloud login -sso
# ibmcloud ks cluster config annotations
# export KUBECONFIG="/Users/niko/.bluemix/plugins/container-service/clusters/annotations/kube-config-wdc04-annotations.yml"
# kl apply -f secret.yaml

cert=$(sudo openssl base64 -in /etc/letsencrypt/live/annotations.ai/fullchain.pem)
key=$(sudo openssl base64 -in /etc/letsencrypt/live/annotations.ai/privkey.pem)

stripped_cert=$(tr -d '\n' <<< "$cert")
stripped_key=$(tr -d '\n' <<< "$key")

echo "apiVersion: v1
kind: Secret
metadata:
  name: annotations-secret
type: Opaque
data:
  tls.crt: ""$stripped_cert""
  tls.key: ""$stripped_key""" > k8sv2/secret.yaml
