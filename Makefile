ORG=cloudannotations
REPO=cloudannotations
TAG=0.0.1

.PHONY: docker-publish
docker-publish:
	# DOCKER_BUILDKIT=1 
	@docker build -t ${ORG}/${REPO}:${TAG} .
	@docker push ${ORG}/${REPO}:${TAG}

.PHONY: clean
clean:
	yarn lerna exec "rm -rf node_modules dist build"
	rm -rf node_modules

.PHONY: install
install:
	yarn install
	yarn lerna bootstrap

.PHONY: build
build:
	yarn lerna run build --stream

.PHONY: start
start:
	yarn lerna run build --stream --ignore @iris/app
	FORCE_COLOR=true yarn lerna run start --parallel --stream

.PHONY: storybook
storybook:
	yarn lerna exec "rm -rf node_modules/html-webpack-plugin/node_modules/webpack" --scope @iris/components
	# exec makes progress bar work
	yarn lerna exec "yarn storybook" --scope @iris/components