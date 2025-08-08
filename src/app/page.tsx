import { TimelineContainer } from '@/components/timeline/timeline-container';
import { getEvents, getRooms } from '@/lib/data';
import { Suspense } from 'react';

function TimelineLoading() {
    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Loading timeline...</p>
        </div>
    )
}

export default async function HomePage() {
  const roomsTree = await getRooms();
  const events = await getEvents();

  return (
    <main className="h-full bg-background">
      <Suspense fallback={<TimelineLoading />}>
        <TimelineContainer initialRooms={roomsTree} initialEvents={events} />
      </Suspense>
    </main>
  );
}
