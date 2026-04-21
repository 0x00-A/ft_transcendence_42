FROM node:20-alpine

WORKDIR /app

COPY package*.json /app
RUN npm i

# RUN npm i -g serve


COPY . .
RUN npm run build

# EXPOSE 3000

# CMD [ "serve", "-s", "dist" ]
