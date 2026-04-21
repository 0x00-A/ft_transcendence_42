#!/bin/sh

set -e

python manage.py wait_for_db
python manage.py collectstatic --noinput

python manage.py makemigrations
python manage.py migrate
python manage.py create_badges
python manage.py create_achievements
python manage.py createsuperuser_auto
# python manage.py load_initial_data
# python manage.py runserver 0.0.0.0:8000
#uwsgi --socket :8000 --master --enable-threads --module app.wsgi

daphne -b 0.0.0.0 -p 8000 app.asgi:application