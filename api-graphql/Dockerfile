# Étape 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/*.graphql ./dist/

USER appuser

EXPOSE 4000

CMD ["node", "dist/main.js"] 