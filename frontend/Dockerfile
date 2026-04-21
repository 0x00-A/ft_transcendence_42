FROM node:20-alpine

WORKDIR /app/frontend/

COPY package*.json /app/frontend/
RUN npm i

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
