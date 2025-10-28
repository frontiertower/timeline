
'use client';

import type { Event, Room, EventSource } from '@/lib/types';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  areIntervalsOverlapping,
  parseISO,
  parse,
  format,
  differenceInMinutes
} from 'date-fns';
import { TimelineHeader } from './timeline-header';
import { TimelineView } from './timeline-view';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineContainerProps {
  initialRooms: Room;
  initialEvents: Event[];
}

function TimelineContainerComponent({ initialRooms, initialEvents }: TimelineContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [visibleSources, setVisibleSources] = useState<EventSource[]>(['frontier-tower', 'luma', 'mock']);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fromParam = searchParams.get('from');
    const zoomParam = searchParams.get('zoom') as ZoomLevel;
    const sourcesParam = searchParams.get('sources');

    if (zoomParam) {
        setZoom(zoomParam);
    }
    if (fromParam) {
        const parsedDate = parse(fromParam, 'yyyy-MM-dd', new Date());
        setCurrentDate(parsedDate);
    } else {
        setCurrentDate(new Date());
    }
    if(sourcesParam) {
        setVisibleSources(sourcesParam.split(',') as EventSource[]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMounted) {
        const queryParams = new URLSearchParams();
        queryParams.set('zoom', zoom);
        queryParams.set('from', format(currentDate, 'yyyy-MM-dd'));
        queryParams.set('sources', visibleSources.join(','));
        const newUrl = `/?${queryParams.toString()}`;
        window.history.pushState({}, '', newUrl);
    }
  }, [zoom, currentDate, visibleSources, isMounted]);

  const dateRange = useMemo(() => {
    switch (zoom) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
      case 'week':
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  }, [currentDate, zoom]);

  const handleZoomChange = (newZoom: ZoomLevel) => {
    setZoom(newZoom);
  };
  
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = {
      day: direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1),
      week: direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1),
      month: direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1),
    }[zoom];
    setCurrentDate(newDate);
  };

  const allRoomIds = useMemo(() => {
    const ids = new Set<string>();
    const flatten = (node: Room) => {
      ids.add(node.id);
      if (node.children) {
        node.children.forEach(flatten);
      }
    };
    if (initialRooms) {
      flatten(initialRooms);
    }
    return ids;
  }, [initialRooms]);
  
  const visibleEvents = useMemo(() => {
    const unknownLocations = new Set<string>();
    
    // 1. Filter events by date range and selected sources
    let filteredEvents = initialEvents.filter(event => {
      if (!visibleSources.includes(event.source)) {
          return false;
      }
      const eventStart = parseISO(event.startsAt);
      const eventEnd = parseISO(event.endsAt);
      return areIntervalsOverlapping(
        { start: eventStart, end: eventEnd },
        dateRange
      );
    });

    // 2. De-duplicate if both FT and Luma are selected
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

                    // If same name, close start time, and from different main sources
                    if (timeDiff <= 5 && eventA.source !== eventB.source && (eventA.source === 'frontier-tower' || eventB.source === 'frontier-tower')) {
                        const ftEvent = eventA.source === 'frontier-tower' ? eventA : eventB;
                        const lumaEvent = eventA.source === 'luma' ? eventA : eventB;

                        mergedEvent = { ...ftEvent }; // clone FT event
                        mergedEvent.id = `${ftEvent.id},${lumaEvent.id}`;
                        
                        // Use more specific location if available
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

    // 3. Normalize locations
    const eventsWithValidLocations = filteredEvents.map(event => {
        const locationIsValid = event.location && allRoomIds.has(event.location);
        if (!locationIsValid && event.location) {
          unknownLocations.add(event.location);
        }
        return {
            ...event,
            location: locationIsValid ? event.location : 'frontier-tower',
        }
    });

    if (unknownLocations.size > 0 && typeof window !== 'undefined') {
      console.warn('Detected events with unknown locations:', Array.from(unknownLocations));
    }

    return eventsWithValidLocations;

  }, [initialEvents, dateRange, allRoomIds, visibleSources]);
  
  const flattenedVisibleRooms = useMemo(() => {
    const roomIdsWithEvents = new Set(visibleEvents.map(event => event.location));
    const visibleTree: Room[] = [];
  
    if (!initialRooms) {
      return visibleTree;
    }
  
    const buildingNode = { ...initialRooms, children: initialRooms.children || [] };
    let buildingHasEvents = roomIdsWithEvents.has(buildingNode.id);
    const visibleFloors: Room[] = [];
  
    buildingNode.children.forEach(floor => {
      let floorHasEvents = roomIdsWithEvents.has(floor.id);
      const roomsWithEvents = floor.children?.filter(room => roomIdsWithEvents.has(room.id)) || [];
  
      if (floorHasEvents || roomsWithEvents.length > 0) {
        const floorNode = { ...floor, children: roomsWithEvents };
        visibleFloors.push(floorNode);
        if (roomsWithEvents.length > 0 || floorHasEvents) {
            buildingHasEvents = true; 
        }
      }
    });
  
    if (visibleFloors.length > 0 || buildingHasEvents) {
      visibleTree.push(buildingNode);
      visibleFloors.forEach(floor => {
          visibleTree.push(floor);
          if (floor.children) {
              visibleTree.push(...floor.children);
          }
      });
    }
  
    return visibleTree;
  }, [initialRooms, visibleEvents]);


  if (!isMounted) {
      return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TimelineHeader
        zoom={zoom}
        onZoomChange={handleZoomChange}
        dateRange={dateRange}
        onNavigate={handleNavigate}
        visibleSources={visibleSources}
        onVisibleSourcesChange={setVisibleSources}
      />
        <div className="flex flex-col flex-1 mt-4 rounded-lg shadow-sm relative">
            {flattenedVisibleRooms.length > 0 ? (
                <TimelineView
                    events={visibleEvents}
                    dateRange={dateRange}
                    zoom={zoom}
                    flattenedRooms={flattenedVisibleRooms}
                    onZoomChange={handleZoomChange}
                    onDateChange={handleDateChange}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
                    <p>No events scheduled for this period.</p>
                </div>
            )}
        </div>
    </div>
  );
}


export function TimelineContainer(props: TimelineContainerProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TimelineContainerComponent {...props} />
        </Suspense>
    )
}
