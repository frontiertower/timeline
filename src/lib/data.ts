import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // Room data is hardcoded and imported from rooms.ts
  return Promise.resolve(rooms);
}

const getAppUrl = () => {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003';
}

export async function getEvents(): Promise<Event[]> {
  try {
    const appUrl = getAppUrl();
    // Fetch from our own API proxy
    const response = await fetch(`${appUrl}/api/events`, {
      next: {
        revalidate: 3600 // Revalidate every hour
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch events from internal API:', { status: response.status });
      throw new Error('Failed to fetch events');
    }

    const events: Event[] = await response.json();

    // Combine real events with mock events
    return [...events, ...mockEvents];

  } catch (error) {
    console.error('Error fetching events, falling back to mock data:', error);
    return mockEvents;
  }
}