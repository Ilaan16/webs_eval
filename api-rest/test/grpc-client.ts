import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../proto/notifications.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationsProto = grpc.loadPackageDefinition(packageDefinition);

const client = new (
  notificationsProto as any
).notifications.NotificationsService(
  'localhost:50051',
  grpc.credentials.createInsecure(),
);

// Fonction utilitaire pour promisifier les appels gRPC
function promisify<T>(fn: Function): (...args: any[]) => Promise<T> {
  return (...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      fn(...args, (error: any, response: T) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}

// Fonction pour créer une notification
async function createNotification() {
  const data = {
    reservation_id: 1,
    message: 'Test notification',
    notification_date: new Date().toISOString(),
  };

  const createNotificationPromise = promisify(
    client.createNotification.bind(client),
  );
  const response = await createNotificationPromise(data);
  console.log('Created notification:', response);
}

// Fonction pour récupérer une notification
async function getNotification(id: number) {
  const getNotificationPromise = promisify(client.getNotification.bind(client));
  const response = await getNotificationPromise({ id });
  console.log('Retrieved notification:', response);
}

// Fonction pour mettre à jour une notification
async function updateNotification(id: number) {
  const data = {
    id,
    message: 'Updated notification',
    notification_date: new Date().toISOString(),
  };

  const updateNotificationPromise = promisify(
    client.updateNotification.bind(client),
  );
  const response = await updateNotificationPromise(data);
  console.log('Updated notification:', response);
}

// Exécuter les tests
async function runTests() {
  try {
    console.log('Creating notification...');
    await createNotification();

    console.log('\nGetting notification with ID 1...');
    await getNotification(1);

    console.log('\nUpdating notification with ID 1...');
    await updateNotification(1);
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

runTests().catch(console.error);
