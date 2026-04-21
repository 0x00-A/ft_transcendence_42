# DOCKER_COMPOSE_NAME=docker-compose-deploy.yml
DOCKER_COMPOSE_NAME=docker-compose.yml

all: up

clean:
	docker-compose -f $(DOCKER_COMPOSE_NAME) down -v

fclean:
	docker-compose -f $(DOCKER_COMPOSE_NAME) down --rmi all -v

up:
	docker-compose -f $(DOCKER_COMPOSE_NAME) --env-file .env up

build:
	docker-compose -f $(DOCKER_COMPOSE_NAME) --env-file .env up --build


down:
	docker-compose -f $(DOCKER_COMPOSE_NAME) down

makemigrations:
	docker-compose run --rm backend sh -c "python manage.py makemigrations"

test:
	docker-compose run --rm backend sh -c "python manage.py test"

shell:
	docker-compose run --rm backend sh -c "python manage.py shell"

clean-migrations:
	cd backend && \
	find accounts/migrations chat/migrations game/migrations matchmaker/migrations relationships/migrations \
	-type f ! -name '__init__.py' -name '*.py' -delete

re: fclean all
