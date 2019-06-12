cert=$(sudo openssl base64 -in /etc/letsencrypt/live/annotations.ai/cert.pem)
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
  tls.key: ""$stripped_key""" > secret.yaml
