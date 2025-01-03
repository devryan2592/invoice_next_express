.PHONY: build up down down-v logs logs-api logs-db prune ps shell-db shell-redis

# Build and start all services
build:
	docker compose -f local.yml up --build -d --remove-orphans

# Start all services
up:
	docker compose -f local.yml up -d

# Stop all services
down:
	docker compose -f local.yml down

# Stop all services and remove volumes
down-v:
	docker compose -f local.yml down -v

# Show logs for all services
logs:
	docker compose -f local.yml logs -f

# Show logs for specific services
logs-api:
	docker compose -f local.yml logs -f api

logs-db:
	docker compose -f local.yml logs -f postgres

logs-redis:
	docker compose -f local.yml logs -f redis

# Database commands
db-shell:
	docker compose -f local.yml exec postgres psql -U postgres -d app_db

# Redis commands
redis-shell:
	docker compose -f local.yml exec redis redis-cli

# Inspect volumes
volume-db:
	docker volume inspect invoice_app_postgres_data

volume-redis:
	docker volume inspect invoice_app_redis_data

# Show running containers
ps:
	docker compose -f local.yml ps

# Prune all unused containers, networks, and volumes
prune:
	docker system prune -f
	docker volume prune -f

# Backup database
backup-db:
	docker compose -f local.yml exec -T postgres pg_dump -U postgres app_db > backup.sql

# Restore database
restore-db:
	docker compose -f local.yml exec -T postgres psql -U postgres app_db < backup.sql

# Reset database (down, remove volumes, up)
reset-db: down-v up

# Health check
health:
	docker compose -f local.yml ps
	echo Volumes:
	docker volume ls | grep invoice_app
	echo Networks:
	docker network ls | grep invoice_app

# Help
help:
	@echo Available commands:
	@echo   make build          - Build and start all services
	@echo   make up            - Start all services
	@echo   make down          - Stop all services
	@echo   make down-v        - Stop all services and remove volumes
	@echo   make logs          - Show logs for all services
	@echo   make logs-api      - Show logs for API service
	@echo   make logs-db       - Show logs for PostgreSQL
	@echo   make logs-redis    - Show logs for Redis
	@echo   make db-shell      - Open PostgreSQL shell
	@echo   make redis-shell   - Open Redis shell
	@echo   make volume-db     - Inspect PostgreSQL volume
	@echo   make volume-redis  - Inspect Redis volume
	@echo   make ps            - Show running containers
	@echo   make prune         - Remove unused Docker resources
	@echo   make backup-db     - Backup PostgreSQL database
	@echo   make restore-db    - Restore PostgreSQL database
	@echo   make reset-db      - Reset database (down-v + up)
	@echo   make health        - Show health status of services 