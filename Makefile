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
	cd iris-plugin-box-tool && yarn start

.PHONY: backend
backend:
	cd ui-backend && yarn start

.PHONY: frontend
frontend:
	cd ui-frontend && yarn start


