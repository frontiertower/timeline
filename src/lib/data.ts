import type { Room, Event } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';

export async function getRooms(): Promise<Room> {
  // Room data is hardcoded and imported from rooms.ts
  return Promise.resolve(rooms);
}

export async function getEvents(): Promise<Event[]> {
  try {
    let allEvents: Event[] = [];
    let nextUrl: string | null = 'https://api.berlinhouse.com/events/';
    let pageCount = 0;
    const maxPages = 10;

    while (nextUrl && pageCount < maxPages) {
        pageCount++;
        const response = await fetch(nextUrl, {
            headers: {
                'X-API-Key': `${process.env.FRONTIER_TOWER_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 3600 // Revalidate every hour
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch from external API:', { status: response.status, url: nextUrl });
            throw new Error(`Failed to fetch events from external source. Status: ${response.status}`);
        }

        const json = await response.json();
        if (json.results && Array.isArray(json.results)) {
            const coloredEvents = json.results.map((event: any) => ({
                ...event,
                id: String(event.id),
                color: 'hsl(259 80% 70%)', // primary purple
            }));
            allEvents = allEvents.concat(coloredEvents);
        }
        
        nextUrl = json.next;
    }

    // Combine real events with mock events
    return [...allEvents, ...mockEvents];

  } catch (error) {
    console.error('Error fetching real events, falling back to mock data:', error);
    // In case of error, return only mock events to keep the app functional.
    return mockEvents;
  }
}
