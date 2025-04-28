# Service gRPC pour les Notifications et l'Export

Ce microservice gRPC est responsable de deux fonctionnalités principales :

1. **Gestion des notifications** : Création, mise à jour et consultation des notifications liées aux réservations.
2. **Export des réservations** : Génération de fichiers CSV contenant les réservations d'un utilisateur et stockage sur MinIO.

## Structure du service

```
grpc-service/
├── proto/
│   └── service.proto       # Définition des services gRPC
├── src/
│   ├── entities/           # Entités TypeORM
│   ├── notification/       # Service et contrôleur pour les notifications
│   ├── export/             # Service et contrôleur pour l'export de réservations
│   ├── minio/              # Service pour interagir avec MinIO
│   ├── app.module.ts       # Module principal de l'application
│   └── main.ts             # Point d'entrée de l'application
├── Dockerfile              # Instructions pour construire l'image Docker
├── package.json            # Dépendances et scripts
└── tsconfig.json           # Configuration TypeScript
```

## Services gRPC

### Service de Notifications

- `CreateNotification` : Crée une nouvelle notification pour une réservation
- `UpdateNotification` : Met à jour une notification existante
- `GetNotification` : Récupère les détails d'une notification

### Service d'Export

- `ExportReservations` : Génère un fichier CSV des réservations d'un utilisateur, le stocke sur MinIO et renvoie l'URL de téléchargement

## Démarrage du service

Le service peut être démarré avec Docker Compose :

```bash
docker-compose up grpc-service
```

Ou pour un démarrage en développement local :

```bash
npm install
npm run dev
```

Le service gRPC écoute sur le port 50051 par défaut. 