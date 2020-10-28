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


.PHONY: storybook
storybook:
	rm -rf ./packages/storybook/node_modules/html-webpack-plugin/node_modules/webpack
	FORCE_COLOR=true yarn lerna exec "yarn storybook" --scope storybook