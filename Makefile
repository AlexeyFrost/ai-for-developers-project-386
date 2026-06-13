.PHONY: dev dev-backend dev-frontend deps build build-backend build-frontend tsp openapi test-e2e e2e-install check up down docker-config docker-build docker-run

API_URL ?= http://localhost:3001
DOCKER_IMAGE ?= calendar-app
DOCKER_PORT ?= 3000
IMAGE ?= $(DOCKER_IMAGE)
CONTAINER ?= calendar-app
PORT ?= $(DOCKER_PORT)
DOCKER_CONFIG_DIR ?= .tmp/docker-config

dev:
	+$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	npm --prefix backend run dev

dev-frontend:
	VITE_API_BASE_URL=$(API_URL) npm --prefix frontend run dev

deps:
	npm ci
	npm --prefix backend ci
	npm --prefix frontend ci

build-backend:
	npm --prefix backend run build

build-frontend:
	npm --prefix frontend run build

tsp:
	npm run tsp:compile

openapi:
	npm run openapi

test-e2e:
	npm run test:e2e

e2e-install:
	npm run e2e:install

build: build-backend build-frontend tsp

check: build openapi

up: docker-config
	@$(MAKE) --no-print-directory down
	DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker build -t $(IMAGE) .
	DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker run -d --name $(CONTAINER) -p $(PORT):$(PORT) -e PORT=$(PORT) $(IMAGE)
	@printf 'Calendar app is running at http://localhost:%s\n' "$(PORT)"

down: docker-config
	@DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker rm -f $(CONTAINER) >/dev/null 2>&1 || true
	@containers="$$(DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker ps -aq --filter ancestor=$(IMAGE))"; \
	if [ -n "$$containers" ]; then \
		DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker rm -f $$containers; \
	fi

docker-config:
	@mkdir -p $(DOCKER_CONFIG_DIR)

docker-build: docker-config
	DOCKER_CONFIG=$(DOCKER_CONFIG_DIR) docker build -t $(IMAGE) .

docker-run: up
