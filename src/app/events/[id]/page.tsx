
import { getEvents, getRooms } from '@/lib/data';
import type { Event, Room } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface EventPageProps {
  params: {
    id: string;
  };
}

const findRoom = (roomId: string, root: Room): Room | null => {
    if (!roomId) return null;
    const queue: Room[] = [root];
    while(queue.length > 0) {
        const current = queue.shift();
        if (current?.id === roomId) {
            return current;
        }
        if (current?.children) {
            queue.push(...current.children);
        }
    }
    return null;
}

export default async function EventPage({ params }: EventPageProps) {
  const events = await getEvents();
  const event = events.find((e: Event) => String(e.id) === params.id);
  
  if (!event) {
    notFound();
  }
  
  const rooms = await getRooms();
  let room = findRoom(event.location, rooms);

  // If the room is not found, default to the main building
  if (!room) {
    room = rooms; // rooms is the root 'frontier-tower' object
  }
  
  const eventStart = new Date(event.startsAt);
  const eventEnd = new Date(event.endsAt);

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Timeline
                </Link>
            </Button>
            <Card className="shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline">{event.name}</CardTitle>
                    <CardDescription className="text-base pt-4 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2">
                        <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-accent"/>
                            {room.name || 'Unknown Location'}
                        </span>
                         <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-accent"/>
                            {format(eventStart, 'EEEE, MMMM d, yyyy')}
                        </span>
                         <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent"/>
                            {format(eventStart, 'p')} - {format(eventEnd, 'p')}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {
                        event.description.split('\n').map((line, index) => (
                            <p key={index} className="text-lg leading-relaxed">{line}</p>
                        ))
                    }
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
