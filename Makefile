ORG=cloudannotations
REPO=cloudannotations
TAG=0.0.1

.PHONY: docker-publish
docker-publish:
	# DOCKER_BUILDKIT=1 
	@docker build -t ${ORG}/${REPO}:${TAG} .
	@docker push ${ORG}/${REPO}:${TAG}

.PHONY: plugins
plugins:
	cd packages/iris-plugin-box-tool && yarn start

.PHONY: client
client:
	cd packages/iris-app && yarn start

.PHONY: server
server:
	cd iris && yarn start


