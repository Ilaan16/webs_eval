# Étape 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Copier le reste du code source
COPY . .

# Compiler l'application
RUN npm run build

# Supprimer les devDependencies après le build (optionnel, économise de l'espace dans cette étape)
RUN npm prune --omit=dev

# Étape 2: Production
FROM node:20-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les fichiers de dépendances (uniquement pour la commande npm ci)
COPY --chown=appuser:appgroup package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier les artefacts de build depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Changer le propriétaire du répertoire de travail
USER appuser

# Exposer le port (lu depuis process.env.PORT ou 3000 par défaut dans main.ts)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "dist/main.js"] 