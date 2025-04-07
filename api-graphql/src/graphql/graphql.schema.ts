
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class Room {
    id: string;
    name: string;
    capacity: number;
    location?: Nullable<string>;
    created_at: DateTime;
}

export class Reservation {
    id: string;
    user_id: number;
    room_id: number;
    start_time: DateTime;
    end_time: DateTime;
    created_at: DateTime;
}

export class User {
    id: string;
    keycloak_id: string;
    created_at: DateTime;
    email?: Nullable<string>;
}

export class AuthPayload {
    accessToken: string;
}

export abstract class IQuery {
    abstract listRooms(skip?: Nullable<number>, limit?: Nullable<number>): Room[] | Promise<Room[]>;

    abstract room(id: string): Nullable<Room> | Promise<Nullable<Room>>;

    abstract listReservations(skip?: Nullable<number>, limit?: Nullable<number>): Reservation[] | Promise<Reservation[]>;

    abstract reservation(id: string): Nullable<Reservation> | Promise<Nullable<Reservation>>;

    abstract listUsers(skip?: Nullable<number>, limit?: Nullable<number>): User[] | Promise<User[]>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract login(email: string, password: string): Nullable<AuthPayload> | Promise<Nullable<AuthPayload>>;

    abstract createRoom(name: string, capacity: number, location?: Nullable<string>): Room | Promise<Room>;

    abstract updateRoom(id: string, name?: Nullable<string>, capacity?: Nullable<number>, location?: Nullable<string>): Room | Promise<Room>;

    abstract deleteRoom(id: string): boolean | Promise<boolean>;

    abstract createReservation(user_id: number, room_id: number, start_time: DateTime, end_time: DateTime): Reservation | Promise<Reservation>;

    abstract updateReservation(id: string, user_id?: Nullable<number>, room_id?: Nullable<number>, start_time?: Nullable<DateTime>, end_time?: Nullable<DateTime>): Reservation | Promise<Reservation>;

    abstract deleteReservation(id: string): boolean | Promise<boolean>;
}

export type DateTime = any;
type Nullable<T> = T | null;
