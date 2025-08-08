import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // Room data is hardcoded and imported from rooms.ts
  return Promise.resolve(rooms);
}

export async function getEvents(): Promise<Event[]> {
  try {
    // In a real app, you'd fetch from your own API route which protects the key
    const response = await fetch('/api/events'); 
    if (!response.ok) {
        console.error('Failed to fetch events from API, falling back to mock data.');
        return mockEvents;
    }
    const realEvents = await response.json();
    
    // Combine real events with mock events
    return [...realEvents, ...mockEvents];

  } catch (error) {
    console.error('Error fetching events, falling back to mock data:', error);
    return mockEvents;
  }
}
