# sudo certbot certonly --manual --preferred-challenges=dns
# *.annotations.ai, annotations.ai
# nslookup -type=TXT _acme-challenge.annotations.ai

# run this script, then:
# ./generate-secret.sh 

# ibmcloud login -a https://cloud.ibm.com -r us-east -g prod --sso
# ibmcloud ks cluster config --cluster c6bbmpjw0i2st0vc9gr0
# kl apply -f secret.yaml

cert=$(sudo openssl base64 -in /etc/letsencrypt/live/annotations.ai/fullchain.pem)
key=$(sudo openssl base64 -in /etc/letsencrypt/live/annotations.ai/privkey.pem)

stripped_cert=$(tr -d '\n' <<< "$cert")
stripped_key=$(tr -d '\n' <<< "$key")

echo "apiVersion: v1
kind: Secret
metadata:
  name: certbot-annotations-secret
type: Opaque
data:
  tls.crt: ""$stripped_cert""
  tls.key: ""$stripped_key""" > secret.yaml
