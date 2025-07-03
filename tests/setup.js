// tests/setupKeycloak.js
const axios = require('axios');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

let keycloakUsrAccessToken = '';
let keycloakAdmAccessToken = '';
let keycloakAdminToken = '';

/**
 * Récupère un token Keycloak via le flow "Resource Owner Password Credentials"
 * et le stocke dans keycloakAccessToken.
 */
async function getKeycloakUsrToken() {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        username: process.env.KEYCLOAK_TEST_USR_USERNAME,
        password: process.env.KEYCLOAK_TEST_USR_PASSWORD,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    keycloakUsrAccessToken = response.data.access_token;
  } catch (error) {
    const simplifiedError = {
      message: 'Impossible de récupérer le token Keycloak pour USER',
      status: error.response?.status,
      data: error.response?.data,
    };
    console.error(simplifiedError);
    throw new Error(JSON.stringify(simplifiedError));
  }
}
/**
 * Récupère un token Keycloak via le flow "Resource Owner Password Credentials"
 * et le stocke dans keycloakAccessToken.
 */
async function getKeycloakAdmToken() {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        username: process.env.KEYCLOAK_TEST_ADM_USERNAME,
        password: process.env.KEYCLOAK_TEST_ADM_PASSWORD,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    keycloakAdmAccessToken = response.data.access_token;
  } catch (error) {
    const simplifiedError = {
      message: 'Impossible de récupérer le token Keycloak pour ADM',
      status: error.response?.status,
      data: error.response?.data,
    };
    console.error(simplifiedError);
    throw new Error(JSON.stringify(simplifiedError));
  }
}

/**
 * Récupère un token admin Keycloak pour effectuer des actions d'administration
 * et le stocke dans keycloakAdminToken.
 */
async function getKeycloakAdminToken() {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    keycloakAdminToken = response.data.access_token;
  } catch (error) {
    const simplifiedError = {
      message: 'Impossible de récupérer le token Keycloak pour ADMIN',
      status: error.response?.status,
      data: error.response?.data,
    };
    console.error(simplifiedError);
    throw new Error(JSON.stringify(simplifiedError));
  }
}

// Getter pour récupérer le token dans d'autres fichiers de test
function getUsrToken() {
  return keycloakUsrAccessToken;
}
// Getter pour récupérer le token dans d'autres fichiers de test
function getAdmToken() {
  return keycloakAdmAccessToken;
}

function getAdminToken() {
  return keycloakAdminToken;
}

/**
 * Vérifie le token JWT généré via le JWKS de Keycloak.
 *
 * @param {string} token - Le token JWT que l'on souhaite vérifier.
 * @returns {Promise<Object>} - Retourne le payload décodé du token si la vérification réussit, sinon lève une erreur.
 */
async function verifyJwtToken(token) {
  // Initialise un client JWKS pointant vers les clés publiques du realm Keycloak
  const client = jwksClient({
    jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  });

  // Cette fonction permet à `jsonwebtoken` de récupérer la clé correspondant au kid du token
  function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      // Récupère la clé publique et renvoie au callback
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  }

  // On retourne une Promise pour pouvoir faire un `await` dessus
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        // Vérifie que l'issuer correspond à ton realm Keycloak
        issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        return resolve(decoded);
      },
    );
  });
}

// Hook Jest appelé avant tous les tests
beforeAll(async () => {
  await getKeycloakUsrToken();
  await getKeycloakAdminToken()
  await getKeycloakAdmToken();
}, 30000); // Timeout plus large si nécessaire

module.exports = {
  getUsrToken,
  getAdmToken,
  getAdminToken,
  verifyJwtToken,
};
