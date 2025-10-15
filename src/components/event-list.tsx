
'use client';

import type { Event, Room, EventSource } from '@/lib/types';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { areIntervalsOverlapping, parseISO, parse, format, differenceInMinutes, startOfToday, endOfToday, compareAsc } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Grid } from 'lucide-react';
import { FrontierTowerLogo } from './icons';

interface EventListContainerProps {
  initialRooms: Room;
  initialEvents: Event[];
}

function EventListContainerComponent({ initialRooms, initialEvents }: EventListContainerProps) {
  const searchParams = useSearchParams();
  const [visibleSources, setVisibleSources] = useState<EventSource[]>(['frontier-tower', 'luma', 'mock']);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sourcesParam = searchParams.get('sources');
    if (sourcesParam) {
      setVisibleSources(sourcesParam.split(',') as EventSource[]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMounted) {
      const newUrl = `/?view=list&sources=${visibleSources.join(',')}`;
      window.history.pushState({}, '', newUrl);
    }
  }, [visibleSources, isMounted]);

  const allRoomIds = useMemo(() => {
    const ids = new Set<string>();
    const flatten = (node: Room) => {
      ids.add(node.id);
      if (node.children) node.children.forEach(flatten);
    };
    if (initialRooms) flatten(initialRooms);
    return ids;
  }, [initialRooms]);

  const roomNameMap = useMemo(() => {
    const map = new Map<string, string>();
    const flatten = (node: Room) => {
      map.set(node.id, node.name);
      if (node.children) node.children.forEach(flatten);
    };
    if (initialRooms) flatten(initialRooms);
    return map;
  }, [initialRooms]);

  const processedEvents = useMemo(() => {
    let filteredEvents = initialEvents.filter(event => visibleSources.includes(event.source));

    const shouldDeduplicate = visibleSources.includes('frontier-tower') && visibleSources.includes('luma');
    if (shouldDeduplicate) {
        const eventsByName = new Map<string, Event[]>();
        filteredEvents.forEach(event => {
            if (!eventsByName.has(event.name)) {
                eventsByName.set(event.name, []);
            }
            eventsByName.get(event.name)!.push(event);
        });

        const dedupedEvents: Event[] = [];
        for (const eventGroup of eventsByName.values()) {
            const handledEventIds = new Set<string>();

            for (let i = 0; i < eventGroup.length; i++) {
                const eventA = eventGroup[i];
                if (handledEventIds.has(eventA.id)) continue;

                let mergedEvent: Event | null = null;

                for (let j = i + 1; j < eventGroup.length; j++) {
                    const eventB = eventGroup[j];
                    if (handledEventIds.has(eventB.id)) continue;

                    const timeDiff = Math.abs(differenceInMinutes(parseISO(eventA.startsAt), parseISO(eventB.startsAt)));

                    if (timeDiff <= 5 && eventA.source !== eventB.source && (eventA.source === 'frontier-tower' || eventB.source === 'frontier-tower')) {
                        const ftEvent = eventA.source === 'frontier-tower' ? eventA : eventB;
                        const lumaEvent = eventA.source === 'luma' ? eventA : eventB;

                        mergedEvent = { ...ftEvent };
                        mergedEvent.id = `${ftEvent.id},${lumaEvent.id}`;
                        
                        if ((!ftEvent.location || ftEvent.location === 'frontier-tower') && lumaEvent.location && lumaEvent.location !== 'frontier-tower') {
                          mergedEvent.location = lumaEvent.location;
                        }

                        handledEventIds.add(eventA.id);
                        handledEventIds.add(eventB.id);
                        break; 
                    }
                }

                if (mergedEvent) {
                    dedupedEvents.push(mergedEvent);
                } else if (!handledEventIds.has(eventA.id)) {
                    dedupedEvents.push(eventA);
                }
            }
        }
        filteredEvents = dedupedEvents;
    }
    
    return filteredEvents
        .map(event => {
            const locationIsValid = event.location && allRoomIds.has(event.location);
            return {
                ...event,
                location: locationIsValid ? event.location : 'frontier-tower',
            }
        })
        .sort((a,b) => compareAsc(parseISO(a.startsAt), parseISO(b.startsAt)));
  }, [initialEvents, visibleSources, allRoomIds]);

  const handleSourceChange = (source: EventSource, checked: boolean) => {
    const newSources = checked
      ? [...visibleSources, source]
      : visibleSources.filter(s => s !== source);
    setVisibleSources(newSources);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen gap-4">
       <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 self-start md:self-center">
            <FrontierTowerLogo className="h-8 w-8 text-primary" />
            <div>
            <h1 className="text-2xl font-headline text-foreground">Frontier Tower Events</h1>
             <p className="text-sm text-muted-foreground">List View</p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
             <div className="flex items-center gap-4 pl-4 sm:border-l">
                <div className="flex items-center space-x-2">
                    <Checkbox id="ft-checkbox" checked={visibleSources.includes('frontier-tower')} onCheckedChange={(checked) => handleSourceChange('frontier-tower', !!checked)} style={{'--checkbox-color': 'hsl(259 80% 70%)'} as React.CSSProperties} />
                    <Label htmlFor="ft-checkbox">FrontierTower</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="luma-checkbox" checked={visibleSources.includes('luma')} onCheckedChange={(checked) => handleSourceChange('luma', !!checked)} style={{'--checkbox-color': 'hsl(0 100% 60%)'} as React.CSSProperties}/>
                    <Label htmlFor="luma-checkbox">Luma</Label>
                </div>
            </div>
             <Button asChild variant="outline" size="icon" title="Timeline View">
                <Link href="/">
                    <Grid className="h-4 w-4" />
                </Link>
            </Button>
        </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedEvents.length > 0 ? (
          processedEvents.map(event => {
            const eventStart = parseISO(event.startsAt);
            const eventEnd = parseISO(event.endsAt);
            return (
              <Link key={event.id} href={`/events/${event.id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow" style={{ borderLeft: `4px solid ${event.color}`}}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                     <CardDescription className="flex items-center gap-2 pt-2">
                        <MapPin className="h-4 w-4 text-accent"/>
                        {roomNameMap.get(event.location) || 'Unknown Location'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-accent"/>
                       {format(eventStart, 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent"/>
                      {format(eventStart, 'p')} - {format(eventEnd, 'p')}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full flex-1 flex items-center justify-center text-muted-foreground p-8">
            <p>No events found for the selected sources.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EventListContainer(props: EventListContainerProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventListContainerComponent {...props} />
    </Suspense>
  );
}
