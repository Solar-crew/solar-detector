#!/bin/bash

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
alembic upgrade head

echo "Starting API server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
