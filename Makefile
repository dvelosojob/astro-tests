COMPONENT := instant-sites
CODE_CONTAINER := nodejs
APP_ROOT := /app
DOCKER_COMPOSE_EXEC := docker compose
DOCKER_COMPOSE_FILE := -f ops/docker/docker-compose.ci.yml

.PHONY: build dev logs ps nodev test lint shell exec help all install-browsers

#--------------------
# Misc Tasks
#--------------------

help: ## Print help information for useful tasks
	@echo "This is the help output for the Instant Sites Makefile"
	@echo
	@echo "Available commands:"
	@grep -E '^[.a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\t\033[36m%-20s\033[0m %s\n", $$1, $$2}'

#--------------------
# Dev Tasks
#--------------------

all: dev logs

dev: ## Start the development environment
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} up -d
	@sleep 2

ps: ## List the running containers
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} ps

build: ## Remove node_modules volume and build Docker images
	@echo "🔄 Removing volume '$(COMPONENT)_node_modules'..."
	@docker volume rm $(COMPONENT)_node_modules || echo "⚠️  Volume already removed or does not exist."
	@echo "📦 Building Docker images..."
	@userId=$$(id -u) groupId=$$(id -g) \
	${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} build
	@echo "✅ Build completed!"

rebuild: ## Rebuild Docker images without using cache
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} build --no-cache

nodev: ## Start the development environment without rebuilding images
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} kill
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} rm -f
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} down --remove-orphans

logs: ## View the logs of the containers
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} logs -f $(s)

test: ## Run the tests in the Node.js container
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} exec -T nodejs npm run test

install-browsers: ## Install Playwright browsers in the Node.js container
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} exec -T nodejs npx playwright install chromium

lint: ## Run the linter in the Node.js container
	@userId=$$(id -u) groupId=$$(id -g) \
	${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} exec -T nodejs sh -c "npm run check:eslint && npm run check"

shell: ## Open a shell in the Node.js container
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} exec nodejs /bin/bash

exec: ## Execute a command in the Node.js container
	@userId=$$(id -u) groupId=$$(id -g) ${DOCKER_COMPOSE_EXEC} -p ${COMPONENT} ${DOCKER_COMPOSE_FILE} exec nodejs $(s)
