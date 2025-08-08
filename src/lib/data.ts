import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // Room data is hardcoded and imported from rooms.ts
  return Promise.resolve(rooms);
}

export async function getEvents(): Promise<Event[]> {
  // Events are hardcoded and imported from events.ts
  return Promise.resolve(mockEvents);
}
