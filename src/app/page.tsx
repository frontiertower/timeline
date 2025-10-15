
import { TimelineContainer } from '@/components/timeline/timeline-container';
import { Suspense } from 'react';
import type { Room, Event } from '@/lib/types';
import { getRooms, getEvents } from '@/lib/data';
import { EventListContainer } from '@/components/event-list';

function TimelineLoading() {
    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Loading...</p>
        </div>
    )
}

async function fetchTimelineData(): Promise<{ roomsTree: Room, events: Event[] }> {
    const roomsTree = await getRooms();
    const events = await getEvents();
    return { roomsTree, events };
}

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams?: {
    view?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { roomsTree, events } = await fetchTimelineData();
  const isListView = searchParams?.view === 'list';

  return (
    <main className="bg-background p-4">
      <Suspense fallback={<TimelineLoading />}>
        {isListView ? (
          <EventListContainer initialRooms={roomsTree} initialEvents={events} />
        ) : (
          <TimelineContainer initialRooms={roomsTree} initialEvents={events} />
        )}
      </Suspense>
    </main>
  );
}
