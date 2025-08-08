import type { Event } from '@/lib/types';
import { NextResponse } from 'next/server';

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
                console.error('Failed to fetch from external API:', { status: response.status, url: nextUrl });
                // Return what we have, or an error
                return NextResponse.json({ error: 'Failed to fetch events from external source.' }, { status: response.status });
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

        return NextResponse.json(allEvents);

    } catch (error) {
        console.error('Error in events API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}