import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // This function now fetches from the new API route.
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log('NEXT_PUBLIC_API_URL is not set, falling back to local data.');
    return rooms;
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`);
    if (!response.ok) {
      console.error('Failed to fetch rooms from API, falling back to local data.');
      return rooms;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching rooms, falling back to local data:', error);
    return rooms;
  }
}

export async function getEvents(): Promise<Event[]> {
  // This function now fetches from the new API route.
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log('NEXT_PUBLIC_API_URL is not set, falling back to local data.');
    return mockEvents;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
    if (!response.ok) {
        console.error('Failed to fetch events from API, falling back to mock data.', { status: response.status });
        return mockEvents;
    }
    const realEvents = await response.json();
    
    // Merge real events with mock events, giving precedence to real ones if IDs conflict.
    const allEvents = [...realEvents];
    const realEventIds = new Set(realEvents.map(e => e.id));
    mockEvents.forEach(mockEvent => {
        if (!realEventIds.has(mockEvent.id)) {
        allEvents.push(mockEvent);
        }
    });

    return allEvents;

  } catch (error) {
    console.error('Error fetching events, falling back to mock data:', error);
    return mockEvents;
  }
}
