import { getEvents } from '@/lib/data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch events' }, { status: 500 });
  }
}
