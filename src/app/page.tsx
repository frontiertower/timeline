import { TimelineContainer } from '@/components/timeline/timeline-container';
import { getEvents, getRooms } from '@/lib/data';

export default async function HomePage() {
  const roomsTree = await getRooms();
  const events = await getEvents();

  return (
    <main className="h-full bg-background">
      <TimelineContainer initialRooms={roomsTree} initialEvents={events} />
    </main>
  );
}
