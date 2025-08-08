import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events } from './events';

export async function getRooms(): Promise<Room> {
  // Return hardcoded room data
  return Promise.resolve(rooms);
}

export async function getEvents(): Promise<Event[]> {
  // Return hardcoded event data
  return Promise.resolve(events);
}
