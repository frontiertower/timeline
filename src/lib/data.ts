
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

const locationNameMapping: Record<string, string> = {
    // Luma variations first
    "frontier tower @ blue room": "blue_room",
    "blue room": "blue_room",
    "spaceship": "f2r1",
    "events floor": "f2r1",
    "floor 16": "floor_16",
    "lounge": "f16r1",
    "floor 3": "floor_3",
    "lobby": "f1r1",
    "robot arena": "f0r1",
    "vip room": "f2r2",
    "offices bar": "f3r1",
    "deep work space": "f15r1",
    "coffee meetup": "f16r2",
    "dining room": "f16r4",
    "cinema room": "f16r5",
    "bbq": "f17r1",
    "rave": "f17r2",
    // Frontier Tower API exact matches
    "f0r1": "f0r1",
    "f0r2": "f0r2",
    "f0r3": "f0r3",
    "f1r1": "f1r1",
    "floor_2": "floor_2",
    "f2r1": "f2r1",
    "f2r2": "f2r2",
    "f3r1": "f3r1",
    "floor_3": "floor_3",
    "f15r1": "f15r1",
    "blue_room": "blue_room",
    "floor_16": "floor_16",
    "f16r1": "f16r1",
    "f16r2": "f16r2",
    "f16r3": "f16r3",
    "f16r4": "f16r4",
    "f16r5": "f16r5",
    "f17r1": "f17r1",
    "f17r2": "f17r2",
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

    return 'frontier-tower'; // Default if no match is found
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
