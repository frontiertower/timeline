
'use client';

import { TimelineContainer } from '@/components/timeline/timeline-container';
import { Suspense, useEffect, useState } from 'react';
import type { Room, Event } from '@/lib/types';
import { EventListContainer } from '@/components/event-list';
import { useSearchParams } from 'next/navigation';

function TimelineLoading() {
    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Loading...</p>
        </div>
    )
}

async function fetchTimelineData(): Promise<{ roomsTree: Room, events: Event[] }> {
    const roomsResponse = await fetch('/api/rooms');
    const eventsResponse = await fetch('/api/events');
    
    if (!roomsResponse.ok || !eventsResponse.ok) {
        throw new Error('Failed to fetch timeline data');
    }
    
    const roomsTree = await roomsResponse.json();
    const events = await eventsResponse.json();

    return { roomsTree, events };
}

export const dynamic = 'force-dynamic';

function HomePageContent() {
  const [data, setData] = useState<{ roomsTree: Room, events: Event[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const isListView = searchParams.get('view') === 'list';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fetchedData = await fetchTimelineData();
        setData(fetchedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  if (loading || !data) {
    return (
        <main className="bg-background p-4 h-screen flex">
            <TimelineLoading />
        </main>
    );
  }

  return (
    <main className="bg-background p-4">
      {isListView ? (
        <EventListContainer initialRooms={data.roomsTree} initialEvents={data.events} />
      ) : (
        <TimelineContainer initialRooms={data.roomsTree} initialEvents={data.events} />
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<TimelineLoading />}>
      <HomePageContent />
    </Suspense>
  )
}
