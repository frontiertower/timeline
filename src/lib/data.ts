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
  let realEvents: Event[] = [];
  try {
    const response = await fetch('https://api.berlinhouse.com/events/', {
      headers: {
        'X-API-Key': `${process.env.FRONTIER_TOWER_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600 // Revalidate every hour
      }
    });

    if (response.ok) {
      realEvents = await response.json();
    } else {
      console.error('Failed to fetch real events, using only mock data.', { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching real events:', error);
  }

  // Merge real events with mock events, giving precedence to real ones if IDs conflict.
  const allEvents = [...realEvents];
  const realEventIds = new Set(realEvents.map(e => e.id));
  mockEvents.forEach(mockEvent => {
    if (!realEventIds.has(mockEvent.id)) {
      allEvents.push(mockEvent);
    }
  });

  return allEvents;
}
