FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Créer le dossier proto
RUN mkdir -p proto

# Compiler le projet
RUN npm run build

# Exposer le port gRPC
EXPOSE 50051

# Démarrer l'application
CMD ["node", "dist/main.js"] 