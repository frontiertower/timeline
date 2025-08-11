import { getEvents, clearCache } from '@/lib/data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Clear the cache
    clearCache();
    
    // Re-fetch events to warm up the cache again
    await getEvents();

    return NextResponse.json({ message: 'Event cache refreshed successfully.' });
  } catch (error) {
    console.error('Error refreshing event cache:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
