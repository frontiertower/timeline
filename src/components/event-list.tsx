
'use client';

import type { Event, Room, EventSource } from '@/lib/types';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { areIntervalsOverlapping, parseISO, parse, format, differenceInMinutes, startOfToday, endOfToday, compareAsc, isBefore } from 'date-fns';
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

const getLocationUrl = (id: string) => {
  if (id === 'frontier-tower') {
    return 'https://www.google.com/maps/search/?api=1&query=Frontier%20Tower%20%4014th%20floor%20995%20Market%20Street%2C%20San%20Francisco';
  }
  return `https://ft0.sh/where#${id}`;
};


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
    const today = startOfToday();
    let filteredEvents = initialEvents
        .filter(event => visibleSources.includes(event.source))
        .filter(event => !isBefore(parseISO(event.endsAt), today));


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
            if (eventGroup.length <= 1) {
                dedupedEvents.push(...eventGroup);
                continue;
            }

            const handledEventIds = new Set<string>();
            for (const eventA of eventGroup) {
                if (handledEventIds.has(eventA.id)) continue;

                const similarEvents = [eventA];
                for (const eventB of eventGroup) {
                    if (eventA.id === eventB.id || handledEventIds.has(eventB.id)) continue;

                    const timeDiff = Math.abs(differenceInMinutes(parseISO(eventA.startsAt), parseISO(eventB.startsAt)));
                    if (timeDiff <= 5) {
                        similarEvents.push(eventB);
                    }
                }

                if (similarEvents.length > 1) {
                    const ftEvent = similarEvents.find(e => e.source === 'frontier-tower');
                    const baseEvent = ftEvent || similarEvents[0];
                    
                    const mergedEvent: Event = { ...baseEvent };
                    mergedEvent.id = similarEvents.map(e => e.id).join(',');
                    
                    const lumaEvents = similarEvents.filter(e => e.source === 'luma');
                    const mostSpecificLuma = lumaEvents.find(e => e.location && e.location !== 'frontier-tower');

                    if (mostSpecificLuma && (!baseEvent.location || baseEvent.location === 'frontier-tower')) {
                      mergedEvent.location = mostSpecificLuma.location;
                    }
                    
                    dedupedEvents.push(mergedEvent);
                    similarEvents.forEach(e => handledEventIds.add(e.id));
                } else {
                    dedupedEvents.push(eventA);
                    handledEventIds.add(eventA.id);
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
            <h1 className="text-2xl font-headline text-foreground">Frontier Tower Event List</h1>
             <p className="text-sm text-muted-foreground">
            (
            <Link href="https://ft0.sh/timeline?view=list" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ft0.sh/timeline?view=list
            </Link>
            )</p>
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
            const locationName = roomNameMap.get(event.location) || 'Unknown Location';
            const locationUrl = getLocationUrl(event.location);
            return (
              <Card key={event.id} className="h-full hover:shadow-lg transition-shadow flex flex-col" style={{ borderLeft: `4px solid ${event.color}`}}>
                <Link href={`/events/${event.id}`} className="block flex-grow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                  </CardHeader>
                </Link>
                <CardContent className="flex-grow flex flex-col gap-2 text-sm">
                  <a href={locationUrl} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 pt-2 text-muted-foreground hover:text-primary hover:underline"
                     onClick={(e) => e.stopPropagation()}>
                    <MapPin className="h-4 w-4 text-accent"/>
                    {locationName}
                  </a>
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
