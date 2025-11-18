FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    py3-pip \
    docker-cli \
    git

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
