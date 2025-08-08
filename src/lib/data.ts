import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // Room data is hardcoded and imported from rooms.ts
  return Promise.resolve(rooms);
}

export async function getEvents(): Promise<Event[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (!apiUrl) {
    console.log('NEXT_PUBLIC_API_URL is not set, falling back to local mock data.');
    return mockEvents;
  }

  try {
    // Fetch real events from our own API route
    const response = await fetch(`${apiUrl}/api/events`);
    if (!response.ok) {
      console.error('Failed to fetch events from API, falling back to mock data.', { status: response.status });
      return mockEvents;
    }
    const realEvents: Event[] = await response.json();

    if (!Array.isArray(realEvents)) {
      console.error('API response for events is not an array, falling back to mock data.', { response: realEvents });
      return mockEvents;
    }

    
    // Merge real events with mock events, giving precedence to real ones if IDs conflict.
    const allEvents = [...realEvents];
    const realEventIds = new Set(realEvents.map(e => e.id));
    
    mockEvents.forEach(mockEvent => {
      if (!realEventIds.has(mockEvent.id)) {
        //allEvents.push(mockEvent);
      }
    });

    return allEvents;

  } catch (error) {
    console.error('Error fetching events, falling back to mock data:', error);
    return mockEvents;
  }
}
