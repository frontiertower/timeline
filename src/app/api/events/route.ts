import { NextResponse } from 'next/server';
import type { Event } from '@/lib/types';
import { events as mockEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
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
      console.error('Failed to fetch real events from external API, using only mock data.', { status: response.status });
      // In case of an error from the external API, we can choose to return only mock data
      // or an empty array depending on the desired behavior.
      return NextResponse.json(mockEvents);
    }
  } catch (error) {
    console.error('Error fetching real events from external API:', error);
    // If the fetch itself fails, fall back to mock data.
    return NextResponse.json(mockEvents);
  }

  // Merge real events with mock events, giving precedence to real ones if IDs conflict.
  const allEvents = [...realEvents];
  const realEventIds = new Set(realEvents.map(e => e.id));
  
  mockEvents.forEach(mockEvent => {
    if (!realEventIds.has(mockEvent.id)) {
      allEvents.push(mockEvent);
    }
  });

  return NextResponse.json(allEvents);
}
