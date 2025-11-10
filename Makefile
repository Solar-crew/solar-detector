dev:
	docker compose up --build

lint:
	ruff check apps/
	eslint apps/frontend/src --fix || true

test:
	pytest apps/api/tests
