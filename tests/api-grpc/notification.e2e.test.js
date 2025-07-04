const {getPackage, getConfig} = require("../utils/grpc.utils");
const {closePool, getPool} = require("../utils/db.utils");
const {getUsrToken} = require("../setup");
const {Metadata} = require("@grpc/grpc-js");

const grpcPackage = getPackage('notification');
const configGrpc = getConfig();
const notificationClient = new grpcPackage.NotificationService(configGrpc.url, configGrpc.insecure);

let roomId = '', userId = '', reservationId = '', notificationId = '', accessToken = '';


describe('GRPC Notification Tests', () => {
  beforeAll(async () => {
    accessToken = getUsrToken();
    const pool = getPool();
    //get user
    // insert room, reservation, user, notification

    const userRes = await pool.query(
      `SELECT *
       FROM "users"`);
    const userRows = userRes.rows;
    expect(userRows).toBeDefined()
    expect(userRows.length).toBeGreaterThanOrEqual(1);
    const user = userRows[0];
    userId = user.id;

    const roomRes = await pool.query(
      `INSERT INTO rooms (name, capacity, location, created_at)
       VALUES ('Test', 10, 'Second floor', NOW())
       RETURNING *`,);
    const roomRows = roomRes.rows;
    expect(roomRows).toBeDefined()

    expect(roomRows.length).toBe(1);
    const room = roomRows[0];
    roomId = room.id;

    const reservationRes = await pool.query(
      `INSERT INTO reservations ("user_id", "room_id", "start_time", "end_time", status, created_at)
       VALUES ($1, $2, NOW(), NOW(), 'pending', NOW())
       RETURNING *`,
      [user.id, room.id]
    );
    const reservationRows = reservationRes.rows;
    expect(reservationRows).toBeDefined()
    expect(reservationRows.length).toBe(1);
    const reservation = reservationRows[0];
    reservationId = reservation.id;


    
  });

  afterAll(async () => {
    await closePool();
  });

  it('should create a notification', (done) => {
    const notification = {
      "reservationId": reservationId,
      "message": 'Hello World',
      "notificationDate": new Date().toISOString(),
    };
    const createNotification = (notification) => {
      const metadata = new Metadata();
      metadata.add("authorization", `Bearer ${accessToken}`);
      return new Promise((resolve, reject) => {
        notificationClient.CreateNotification(notification, metadata, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    };

// Usage
    createNotification(notification).then((response) => {
      expect(response).toHaveProperty('id');
      expect(response.reservationId).toBe(reservationId);
      expect(response.message).toBe('Hello World');
      notificationId = response.id;
      done();
    });
  });

  it('should update a notification', (done) => {
    const notification = {
      "id": notificationId,
      "message": 'World Hello',
      "notificationDate": new Date().toISOString(),
    };

    const updateNotification = (notification) => {
      const metadata = new Metadata();
      metadata.add("authorization", `Bearer ${accessToken}`);
      return new Promise((resolve, reject) => {
        notificationClient.UpdateNotification(notification, metadata, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    };

    // Usage
    updateNotification(notification).then((response) => {
      expect(response).toHaveProperty('id');
      expect(response.message).toBe('World Hello');
      done();
    });
  });

  it('should get a notification by ID', (done) => {
    const notification = {
      "id": notificationId
    };

    const getNotification = (notification) => {
      const metadata = new Metadata();
      metadata.add("authorization", `Bearer ${accessToken}`);
      return new Promise((resolve, reject) => {
        notificationClient.GetNotification(notification, metadata, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    };

// Usage
    getNotification(notification).then((response) => {
      expect(response).toHaveProperty('id');
      expect(response.id).toBe(notificationId);
      done();
    });
  });
});