
import type { Room, Event, EventSource } from './types';
import { rooms } from './rooms';
import { events as mockEvents } from './events';
import * as ical from 'node-ical';

const LUMA_URL = 'https://api2.luma.com/ics/get?entity=calendar&id=cal-Sl7q1nHTRXQzjP2';
const FRONTIER_TOWER_API_URL = 'https://api.berlinhouse.com/events/';

const COLORS: Record<EventSource, string> = {
  'frontier-tower': 'hsl(259 80% 70%)', // primary purple
  'luma': 'hsl(0 100% 60%)', // red
  'mock': 'hsl(240 4.8% 95.9%)', // Muted gray
};

// In-memory cache for events
let cachedEvents: Event[] | null = null;
let lastFetchTimestamp: number | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10m

const locationNameMapping: Record<string, string> = {
    // Luma variations first
    "995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "995 market st, san francisco, california": "frontier-tower",
    "995 market street, sf @ spaceship / floor 2": "f2r1",
    "artificial intelligence @ 995 market street, san francisco": "f9",
    "berlinhouse builders @ 995 market street, san francisco": "rooftop-lounge",
    "berlinhouse, 995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "biotech @ 995 market street, san francisco": "f8",
    "ethereum house @ 995 market street, san francisco": "f12",
    "flourishing (floor 14) @ frontier tower, 995 market street, san francisco": "f14",
    "frontier maker space @ 995 market street, san francisco": "f7",
    "frontier tower @ 11th floor annex 995 market street, san francisco": "f11-annex",
    "frontier tower @ 14th floor community kitchen 995 market street, san francisco": "f14-kitchen",
    "frontier tower @ 16th floor coffee meetup 995 market street, san francisco": "16th-coffee-meetup",
    "frontier tower @ artificial intelligence 995 market street, san francisco": "f9",
    "frontier tower @ arts & music 995 market street, san francisco": "f6",
    "frontier tower @ arts and music floor 995 market street, san francisco": "f6",
    "frontier tower @ berlinhouse builders 995 market street, san francisco": "frontier-tower",
    "frontier tower @ biotech 995 market street, san francisco": "f8",
    "frontier tower @ blue room": "f15r2",
    "frontier tower @ ethereum & decentralized tech 995 market street, san francisco": "f12",
    "frontier tower @ ethereum foundation / floor 12 995 market street, san francisco": "f12",
    "frontier tower @ ethereum house 995 market street, san francisco": "f12",
    "frontier tower @ floor 16 lounge | berlinhouse, 995 market street, san francisco": "rooftop-lounge",
    "frontier tower @ floor14 995 market street, san francisco": "f14",
    "frontier tower @ floors 9, 10, 11 - annex 995 market street, san francisco": "frontier-tower",
    "frontier tower @ frontier maker space 995 market street, san francisco": "f7",
    "frontier tower @ frontier makerspace / floor 7 995 market street, san francisco": "f7",
    "frontier tower @ frontier tower fallback location 995 market street, san francisco": "frontier-tower",
    "frontier tower @ hard tech & robotics 995 market street, san francisco": "f4",
    "frontier tower @ human flourishing 995 market street, san francisco": "f14",
    "frontier tower @ human flourishing floor 995 market street, san francisco": "f14",
    "frontier tower @ longevity / floor 11 995 market street, san francisco": "f11",
    "frontier tower @ longevity / floor 11, 995 market street, san francisco": "f11",
    "frontier tower @ longevity & health 995 market street, san francisco": "f14",
    "frontier tower @ lounge / floor 14 995 market street, san francisco": "f14r1",
    "frontier tower @ lounge / floor 16 995 market street, san francisco": "rooftop-lounge",
    "frontier tower @ lounge / floor 16 995 market street, sf": "rooftop-lounge",
    "frontier tower @ lounge 995 market street, san francisco": "rooftop-lounge",
    "frontier tower @ makerspace / floor 7 995 market street, san francisco": "f7",
    "frontier tower @ rooftop 995 market street, san francisco": "f17",
    "frontier tower @ spaceship / floor 2 995 market street, san francisco": "f2r1",
    "frontier tower @floor 14 995 market street, san francisco": "f14",
    "frontier tower @floor 7 995 market street, san francisco": "f7",
    "frontier tower @floor12 995 market street, san francisco": "f12",
    "frontier tower @floor14 995 market street, san francisco": "f14",
    "frontier tower @rooftop 995 market street, san francisco": "f17",
    "frontier tower / floor 2 995 market street, san francisco": "f2",
    "frontier tower \\ floor 14 @ 995 market street, san francisco": "f14",
    "frontier tower | berlinhouse fl 7 — makerspace": "f7",
    "frontier tower | berlinhouse, 995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "frontier tower 🧑‍🚀, 995 market st, san francisco, ca 94103, usa": "frontier-tower",
    "frontier tower floor 14 995 market street, san francisco": "f14",
    "hard tech & robotics @ 995 market street, san francisco": "f4",
    "human flourishing @ 995 market street, san francisco": "f14",
    "longevity & health @ 995 market street, san francisco": "f11",

    // Non FT locations
    "2121 larimer st, denver, co 80205, usa": "frontier-tower",
    "466 eddy st, san francisco, ca 94109, usa": "frontier-tower",
    "55 2nd st 5th floor, san francisco, ca 94105, usa": "frontier-tower",
    "canopy jackson square, 595 pacific ave 4th floor, san francisco, ca 94133, usa": "frontier-tower",
    "club joyful, 2121 lincoln blvd, venice, ca 90291, usa": "frontier-tower",
    "dovetail, 660 market st, san francisco, ca 94104, usa": "frontier-tower",
    "first presbyterian church of oakland, 2619 broadway, oakland, ca 94612, usa": "frontier-tower",
    "fort mason, san francisco, ca 94109, usa": "frontier-tower",
    "hero city, 55 e 3rd ave, san mateo, ca 94401, usa": "frontier-tower",
    "modernist, 139 steuart st, san francisco, ca 94105, usa": "frontier-tower",
    "santa clara convention center, 5001 great america pkwy, santa clara, ca 95054, usa": "frontier-tower",
    "steep ravine, rocky point rd, stinson beach, ca 94970, usa": "frontier-tower",
    "temple nightclub san francisco, 540 howard st, san francisco, ca 94105, usa": "frontier-tower",
    "the clancy, autograph collection, 299 2nd st, san francisco, ca 94105, usa": "frontier-tower",

    // frontier tower api exact matches
    "11th-floor-annex": "f11-annex",
    "14th-kitchen": "14th-kitchen",
    "14th-salon": "14th-salon",
    "15th-blue-room": "15th-blue-room",
    "16th-coffee-meetup": "16th-coffee-meetup",
    "9th-floor-annex": "f9-annex",
    "arts-music-default": "f6",
    "basement": "f0",
    "blue_room": "15th-blue-room",
    "floor 7 - makerspace": "f7",
    "floor_16": "f16",
    "floor_2": "f2",
    "frontier-fallback": "frontier-tower",
    "human-flourishing-default": "f14",
    "rooftop-lounge": "rooftop-lounge",
    "spaceship": "spaceship",
};

function normalizeLocation(location: string | null | undefined, name: string | null | undefined, displayLocation: string | null | undefined, ): string {
    if (!location) {
        return 'frontier-tower';
    }

    let lowerCaseLocation = location.toLowerCase();
    if (lowerCaseLocation === 'my_community') {
      if (displayLocation) {
        lowerCaseLocation = displayLocation.toLowerCase();
      } else {
        return 'frontier-tower';
      }
    }

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

    if (location.indexOf('luma') === -1) {
       console.warn(`No exact match found for location: "${location}", name: "${name}", displayLocation: "${displayLocation}"`)
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
        }
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
          host: event.host,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location: normalizeLocation(event.location, event.name, event.displayLocation),
          originalLocation: event.location,
          color: COLORS['frontier-tower'],
          source: 'frontier-tower',
          rawJson: JSON.stringify(event, null, 2),
        }));
        events.push(...mappedEvents);
      }
      nextUrl = json.next;
    }

  } catch (error) {
    console.error('Error fetching Frontier Tower events:', error);
  }
  console.log(`Fetched ${events.length} events from Frontier Tower API.`);
  return events;
}

function extractLumaHost(description?: string): string {
    if (!description) return '?';
    const hostMarker = 'Hosted by ';
    const hostIndex = description.lastIndexOf(hostMarker);
    if (hostIndex === -1) return '?';
    
    const hostText = description.substring(hostIndex + hostMarker.length);
    const lines = hostText.split('\n');
    return lines[0].trim() || '?';
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
          host: extractLumaHost(event.description),
          location: normalizeLocation(event.location, event.summary, undefined),
          originalLocation: event.location,
          color: COLORS['luma'],
          source: 'luma',
          rawJson: JSON.stringify(event, null, 2),
        });
      }
    }
    console.log(`Fetched ${mappedEvents.length} events from Luma.`)
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching Luma events:', error);
    return [];
  }
}

export function clearCache() {
  cachedEvents = null;
  lastFetchTimestamp = null;
  console.log('Event cache cleared.');
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
  
  cachedEvents = allEvents;
  lastFetchTimestamp = now;

  return cachedEvents;
}

