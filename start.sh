#!/usr/bin/env bash
cd Backend
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT
