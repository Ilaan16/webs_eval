
## TodoList

Refacto l'architecture pour avoir la bonne architecture attendu :

1. **Dossier `api-rest`** :
    - Code source de l’API REST.
    - Fichier `Dockerfile` pour construire l’image Docker.
    - Fichier `swagger.yaml` pour la documentation Swagger.

2. **Dossier `api-graphql`** :
    - Code source de l’API GraphQL.
    - Fichier `Dockerfile` pour construire l’image Docker.

3. **Dossier `grpc-service`** :
    - Code source du microservice gRPC.
    - Fichier `Dockerfile` pour construire l’image Docker.
    - Fichier `proto/service.proto` pour définir les messages et services gRPC.

4. **Dossier `docs`** :
    - Tous fichiers de documentation (Markdown, PDF, etc.).

5. **Dossier `tests`** :
    - Tests fourni par moi

6. **Racine du dépôt** :
    - Fichier `docker-compose.yml` permettant de lancer tous les services.
