FROM python:3.12.7-alpine3.20

LABEL maintainer='abdelatif'

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV DJANGO_SETTINGS_MODULE=app.settings

COPY ./requirements*.txt /tmp/
# COPY ./requirements.dev.txt /tmp/requirements.dev.txt

WORKDIR /app/backend

ARG DEV=false

RUN pip install --upgrade pip && \
    apk add --update --no-cache postgresql-client && \
    apk add --update --no-cache --virtual .tmp-build-deps \
    build-base postgresql-dev musl-dev && \
    pip install -r /tmp/requirements.txt && \
    if [ $DEV = "true" ]; \
    then pip install -r /tmp/requirements.dev.txt ; \
    fi && \
    rm -rf /tmp && \
    apk del .tmp-build-deps && \
    adduser \
    --disabled-password \
    --no-create-home \
    django-user

COPY . /app/backend

#USER django-user

EXPOSE 8000

# ENTRYPOINT [ "python" ]

# CMD [ "manage.py", "runserver", "0.0.0.0:8000" ]
