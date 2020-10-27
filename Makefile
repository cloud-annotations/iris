ORG=cloudannotations
REPO=cloudannotations
TAG=0.0.1

.PHONY: docker-publish
docker-publish:
	# DOCKER_BUILDKIT=1 
	@docker build -t ${ORG}/${REPO}:${TAG} .
	@docker push ${ORG}/${REPO}:${TAG}

.PHONY: start
start:
	FORCE_COLOR=true yarn lerna run start --parallel --stream

# .PHONY: client
# client:
# 	cd packages/iris-app && yarn start

# .PHONY: build
# build:
# 	cd packages/iris-app && yarn build

# .PHONY: server
# server:
# 	cd iris && yarn start

