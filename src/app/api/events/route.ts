import { NextResponse } from 'next/server';
import type { Event } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
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
          // Log the error and stop fetching further pages
          console.error('Failed to fetch events from external API:', { status: response.status, url: nextUrl });
          break; 
      }

      const json = await response.json();
      if (json.results && Array.isArray(json.results)) {
        allEvents = allEvents.concat(json.results);
      }
      
      nextUrl = json.next;
    }

    return NextResponse.json(allEvents);

  } catch (error) {
    console.error('Error fetching events from external API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
