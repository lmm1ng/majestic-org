FROM node:20-alpine

WORKDIR /app

COPY .env ./
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

RUN yarn
RUN yarn build

CMD ["node", "dist/index.js"]
