import { TimelineContainer } from '@/components/timeline/timeline-container';
import { Suspense } from 'react';
import type { Room, Event } from '@/lib/types';
import { getRooms, getEvents } from '@/lib/data';

function TimelineLoading() {
    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Loading timeline...</p>
        </div>
    )
}

async function fetchTimelineData(): Promise<{ roomsTree: Room, events: Event[] }> {
    const roomsTree = await getRooms();
    const events = await getEvents();
    return { roomsTree, events };
}


export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { roomsTree, events } = await fetchTimelineData();

  return (
    <main className="bg-background">
      <Suspense fallback={<TimelineLoading />}>
        <TimelineContainer initialRooms={roomsTree} initialEvents={events} />
      </Suspense>
    </main>
  );
}
