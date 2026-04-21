FROM nginxinc/nginx-unprivileged:1-alpine

# ENV LISTEN_PORT=8080
# ENV APP_HOST=backend
# ENV APP_PORT=8000
USER root

RUN apk update \
    && apk add openssl

COPY ./config/default.conf /etc/nginx/conf.d/default.conf

RUN rm /var/log/nginx/access.log /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log && touch /var/log/nginx/error.log && \
    chown nginx:nginx /var/log/nginx/access.log && \
    chown nginx:nginx /var/log/nginx/error.log

RUN mkdir /etc/nginx/ssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/nginx/ssl/nginx-selfsigned.key -out \
/etc/nginx/ssl/nginx-selfsigned.crt -subj "/CN=$DOMAIN_NAME"
RUN chown -R nginx:nginx /etc/nginx/ssl

# COPY ./scripts/entrypoint.sh /docker-entrypoint.d/entrypoint.sh
# RUN chmod +x /docker-entrypoint.d/entrypoint.sh
RUN rm -rf /usr/share/nginx/html/*

COPY ./LandingPage /usr/share/nginx/LandingPage
RUN chown -R nginx:nginx /usr/share/nginx/LandingPage/*

EXPOSE 80 443

# USER nginx
