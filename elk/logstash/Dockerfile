ARG ELASTIC_VERSION

FROM docker.elastic.co/logstash/logstash:${ELASTIC_VERSION:-8.15.5}

COPY ./pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.conf

# RUN chown logstash:logstash /usr/share/logstash/pipeline/logstash.conf && \
#     chmod 644 /usr/share/logstash/pipeline/logstash.conf
