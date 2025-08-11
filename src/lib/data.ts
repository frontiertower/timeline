
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
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10m

const locationNameMapping: Record<string, string> = {
    // Luma variations first
    "frontier tower @ blue room": "f15r2",
    "frontier tower | berlinhouse, 995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "frontier tower 🧑‍🚀, 995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "frontier tower / floor 2 995 market street, san francisco": "floor-2",
    "frontier tower @ spaceship / floor 2 995 market street, san francisco": "f2r1",
    "frontier tower @ lounge / floor 14 995 market street, san francisco": "f14r1",
    "frontier tower @ lounge / floor 16 995 market street, san francisco": "f16r1",
    "frontier tower @ biotech 995 market street, san francisco": "floor-8",
    "frontier tower @ human flourishing 995 market street, san francisco": "floor-14",
    "frontier tower @ hard tech & robotics 995 market street, san francisco": "floor-4",
    "frontier tower @ artificial intelligence 995 market street, san francisco": "floor-9",
    // frontier tower api exact matches
    "floor_2": "floor-2",
    "floor_16": "floor-16",
    "blue_room": "f15r2",
};

function normalizeLocation(location: string | null | undefined): string {
    if (!location) {
        return 'frontier-tower';
    }

    const lowerCaseLocation = location.toLowerCase();

    // Check for exact matches in the mapping first
    if (locationNameMapping[lowerCaseLocation]) {
        return locationNameMapping[lowerCaseLocation];
    }
    
    // Check for keywords
    for (const key in locationNameMapping) {
        if (lowerCaseLocation.includes(key)) {
            return locationNameMapping[key];
        }
    }

    return location; // Default if no match is found
}


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
          location: normalizeLocation(event.location),
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
          location: normalizeLocation(event.location),
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
    fetchLumaEvents(),
    fetchFrontierTowerEvents(),
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
