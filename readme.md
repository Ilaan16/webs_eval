Etape 1 :
docker compose -f docker-compose.yml up -d --build

Etape 2 : 
cd tests
node init-keycloak.js

Etape 3 : 
npm run test