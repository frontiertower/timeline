
'use client';

import type { Event, Room } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Link as LucidLink, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

interface EventDetailProps {
  id: string;
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

const fetchEventsFromApi = async (): Promise<Event[]> => {
    const response = await fetch('/api/events');
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    return response.json();
}

const fetchRoomsFromApi = async (): Promise<Room> => {
    const response = await fetch('/api/rooms');
     if (!response.ok) {
        throw new Error('Failed to fetch rooms');
    }
    return response.json();
}

function SingleEventCard({ event, room }: { event: Event; room: Room | null }) {
  const eventStart = parseISO(event.startsAt);
  const eventEnd = parseISO(event.endsAt);
  const eventTitle = !event.originalLocation?.startsWith("https://lu.ma") ? event.originalLocation : "";
  const eventLink = event.originalLocation?.startsWith("https://lu.ma") ? event.originalLocation : "";

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">{event.name}</CardTitle>
        <CardDescription className="text-base pt-4 flex flex-col sm:flex-row sm:items-center flex-wrap gap-x-6 gap-y-2">
          {eventLink ? (
            <a className="flex items-center gap-2 hover:underline" title={eventLink} href={eventLink} target="_blank" rel="noopener noreferrer">
              <LucidLink className="h-4 w-4 text-primary"/>
              Luma Event Link
            </a>
          ) : (
            <span className="flex items-center gap-2" title={eventTitle}>
              <MapPin className="h-4 w-4 text-accent"/>
              {room?.name || 'Unknown Location'}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent"/>
            {format(eventStart, 'EEEE, MMMM d, yyyy')}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent"/>
            {format(eventStart, 'p')} - {format(eventEnd, 'p')}
          </span>
          <span className="flex items-center gap-2">
            Hosted by {event.host}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {event.description.split('\n').map((line, index) => (
          <p key={index} className="text-lg leading-relaxed mb-2">{line}</p>
        ))}
      </CardContent>
    </Card>
  );
}


export function EventDetail({ id }: EventDetailProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [rooms, setRooms] = useState<Map<string, Room>>(new Map());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const decodedId = decodeURIComponent(id);
        const eventIds = [...new Set(decodedId.split(','))]; // Ensure unique IDs

        const allEventsPromise = fetchEventsFromApi();
        const roomsDataPromise = fetchRoomsFromApi();
        
        const [allEvents, roomsData] = await Promise.all([allEventsPromise, roomsDataPromise]);

        const currentEvents = eventIds.map(eventId => allEvents.find(e => e.id === eventId)).filter(Boolean) as Event[];
        
        if (currentEvents.length === 0) {
          notFound();
          return;
        }

        const eventRooms = new Map<string, Room>();
        currentEvents.forEach(event => {
            let room = findRoom(event.location, roomsData);
            if (!room) {
              room = roomsData; // Default to main building
            }
            eventRooms.set(event.id, room);
        });

        setEvents(currentEvents);
        setRooms(eventRooms);
      } catch (error) {
        console.error("Failed to fetch event details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
      return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading event(s)...</p>
        </div>
      )
  }

  if (events.length === 0) {
    return notFound();
  }
  
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Timeline
                </Link>
            </Button>

            {events.length > 1 && (
                 <Card className="shadow-lg mb-8 bg-primary/10 border-primary">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                           <Users className="h-6 w-6 text-primary"/>
                           Multiple Events Scheduled
                        </CardTitle>
                        <CardDescription>
                            There are {events.length} events scheduled for this time slot and location.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {events.map(event => (
                <SingleEventCard key={event.id} event={event} room={rooms.get(event.id) || null} />
            ))}
        </div>
    </div>
  );
}
