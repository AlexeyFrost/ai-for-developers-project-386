.PHONY: dev dev-backend dev-frontend deps build build-backend build-frontend tsp openapi check

API_URL ?= http://localhost:3001

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

build: build-backend build-frontend tsp

check: build openapi
