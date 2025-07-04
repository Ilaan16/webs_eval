
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN mkdir -p proto

COPY . .

RUN npm run build

EXPOSE 3000 50051 50052

CMD ["node", "dist/main"]

