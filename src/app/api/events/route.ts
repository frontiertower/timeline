import { NextResponse } from 'next/server';
import type { Event } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    if (!response.ok) {
        // Log the error and return an empty array, or some default/mock data
        console.error('Failed to fetch events from external API:', { status: response.status });
        return NextResponse.json([], { status: response.status });
    }

    const json = await response.json();
    return NextResponse.json(json.results);

  } catch (error) {
    console.error('Error fetching events from external API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
