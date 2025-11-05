.PHONY: help clean dev build install check format test coverage deploy release test-auth watch fix all zip

# Default target
.DEFAULT_GOAL := build

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)ReadAloud - Chrome Extension Development$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

clean: ## Clean build artifacts and TypeScript cache
	npm run clean

dev: ## Start Vite development server
	npm run watch

build: ## Build the extension for production
	npm run build

check: ## Run Biome linting checks
	npx biome check .

format: ## Format code with Biome
	npx biome format --write .

test: ## Run tests
	npm run test

coverage: ## Generate test coverage report
	npm run coverage

test-auth: ## Test service account authentication
	npm run test-auth

deploy: ## Build and deploy to Chrome Web Store
	npm run deploy

release: ## Create a new release. Usage: make release <major|minor|patch>
	$(if $(filter major minor patch,$(MAKECMDGOALS)),,$(error Usage: make release <major|minor|patch>))
	$(eval BUMP_TYPE := $(filter major minor patch,$(MAKECMDGOALS)))
	npm run release -- $(BUMP_TYPE)

# Dummy targets to prevent Make errors when used with release
major minor patch:
	@:

watch: ## Run vite in watch mode
	npm run watch

fix: ## Run Biome linting and apply safe fixes
	npx biome check --write .

all: clean install build ## Clean, install dependencies, and build

zip: build ## Build and create distribution zip (already handled by build)
	@echo "$(GREEN)Distribution zip created in dist/ directory$(NC)"
