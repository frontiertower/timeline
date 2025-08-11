import type { Room, Event, EventSource } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';
import * as ical from 'node-ical';

const LUMA_URL = 'https://api.lu.ma/ics/get?entity=calendar&id=cal-Sl7q1nHTRXQzjP2';
const FRONTIER_TOWER_API_URL = 'https://api.berlinhouse.com/events/';

const COLORS: Record<EventSource, string> = {
  'frontier-tower': 'hsl(259 80% 70%)', // primary purple
  'luma': 'hsl(140 50% 60%)', // green
  'mock': 'hsl(240 4.8% 95.9%)', // Muted gray
};

// In-memory cache for events
let cachedEvents: Event[] | null = null;
let lastFetchTimestamp: number | null = null;
const CACHE_DURATION_MS = 3600 * 1000; // 1 hour

export async function getRooms(): Promise<Room> {
  return Promise.resolve(rooms);
}

async function fetchFrontierTowerEvents(): Promise<Event[]> {
  const events: Event[] = [];
  try {
    let nextUrl: string | null = FRONTIER_TOWER_API_URL;
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
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        console.error('Failed to fetch from Frontier Tower API:', { status: response.status, url: nextUrl });
        break;
      }

      const json = await response.json();
      if (json.results && Array.isArray(json.results)) {
        const mappedEvents = json.results.map((event: any): Event => ({
          id: `ft-${event.id}`,
          name: event.name,
          description: event.description,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location: event.location,
          color: COLORS['frontier-tower'],
          source: 'frontier-tower',
        }));
        events.push(...mappedEvents);
      }
      nextUrl = json.next;
    }
  } catch (error) {
    console.error('Error fetching Frontier Tower events:', error);
  }
  return events;
}

async function fetchLumaEvents(): Promise<Event[]> {
  try {
    const events = await ical.async.fromURL(LUMA_URL);
    const mappedEvents: Event[] = [];

    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT' && event.start && event.end && event.summary) {
        mappedEvents.push({
          id: `luma-${event.uid}`,
          name: event.summary,
          description: event.description || '',
          startsAt: new Date(event.start).toISOString(),
          endsAt: new Date(event.end).toISOString(),
          location: event.location || 'frontier-tower',
          color: COLORS['luma'],
          source: 'luma',
        });
      }
    }
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching Luma events:', error);
    return [];
  }
}

export async function getEvents(): Promise<Event[]> {
  const now = Date.now();
  if (cachedEvents && lastFetchTimestamp && (now - lastFetchTimestamp < CACHE_DURATION_MS)) {
    return cachedEvents;
  }

  console.log('Fetching fresh events...');
  
  const sources = [
    fetchFrontierTowerEvents(),
    fetchLumaEvents(),
  ];

  if (process.env.NODE_ENV !== 'production') {
      sources.push(Promise.resolve(mockEvents));
  }

  const results = await Promise.all(sources);
  const allEvents = results.flat();

  // Deduplicate events
  const uniqueEvents = new Map<string, Event>();
  allEvents.forEach(event => {
    const key = `${event.name}|${event.startsAt}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    }
  });

  cachedEvents = Array.from(uniqueEvents.values());
  lastFetchTimestamp = now;

  return cachedEvents;
}
