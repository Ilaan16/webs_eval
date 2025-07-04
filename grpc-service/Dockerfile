FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p proto

RUN npm run build

EXPOSE 50051

CMD ["node", "dist/main.js"] 