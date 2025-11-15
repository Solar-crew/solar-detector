.PHONY: help dev up down logs clean lint format test migrate migration db-shell api-shell

help:
	@echo "Solar Detector - Available commands:"
	@echo "  make dev          - Start all services in development mode with rebuild"
	@echo "  make up           - Start all services (without rebuild)"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - Follow logs from all services"
	@echo "  make clean        - Remove containers, volumes, and cached files"
	@echo "  make lint         - Run linters on backend and frontend"
	@echo "  make format       - Format code (black for Python, prettier for JS)"
	@echo "  make test         - Run tests"
	@echo "  make migrate      - Run database migrations"
	@echo "  make migration    - Create a new migration (use MESSAGE='description')"
	@echo "  make db-shell     - Open PostgreSQL shell"
	@echo "  make api-shell    - Open shell in API container"

dev:
	cd infra/docker && docker compose up --build

up:
	cd infra/docker && docker compose up -d

down:
	cd infra/docker && docker compose down

logs:
	cd infra/docker && docker compose logs -f

clean:
	cd infra/docker && docker compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

lint:
	cd apps/api && ruff check app/
	cd apps/frontend && yarn lint

format:
	cd apps/api && black app/
	cd apps/frontend && yarn prettier --write src/

test:
	cd apps/api && pytest tests/

migrate:
	cd infra/docker && docker compose exec api alembic upgrade head

migration:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make migration MESSAGE='your description'"; \
		exit 1; \
	fi
	cd infra/docker && docker compose exec api alembic revision --autogenerate -m "$(MESSAGE)"

db-shell:
	cd infra/docker && docker compose exec db psql -U user -d solar_detector

api-shell:
	cd infra/docker && docker compose exec api /bin/bash
