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

  const [zoom, setZoom] = useState<ZoomLevel>('day');
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
        const newUrl = `/?zoom=${zoom}&from=${format(currentDate, 'yyyy-MM-dd')}&sources=${visibleSources.join(',')}`;
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
    const events = initialEvents.filter(event => {
      if (!visibleSources.includes(event.source)) {
          return false;
      }
      const eventStart = parseISO(event.startsAt);
      const eventEnd = parseISO(event.endsAt);
      return areIntervalsOverlapping(
        { start: eventStart, end: eventEnd },
        dateRange
      );
    }).map(event => {
        const locationIsValid = event.location && allRoomIds.has(event.location);
        if (!locationIsValid && event.location) {
          unknownLocations.add(event.location);
        }
        return {
            ...event,
            location: locationIsValid ? event.location : 'frontier-tower',
        }
    });

    if (unknownLocations.size > 0) {
      console.warn('Detected events with unknown locations:', Array.from(unknownLocations));
    }
    return events;
  }, [initialEvents, dateRange, allRoomIds, visibleSources]);
  
  const flattenedVisibleRooms = useMemo(() => {
    const roomIdsWithEvents = new Set(visibleEvents.map(event => event.location));
    const visibleTree: Room[] = [];
  
    if (!initialRooms || visibleEvents.length === 0) {
      if (roomIdsWithEvents.has('frontier-tower')) {
        visibleTree.push({ ...initialRooms, children: [] });
      }
      return visibleTree;
    }
  
    const buildingNode = { ...initialRooms };
    visibleTree.push(buildingNode);
  
    const floors = buildingNode.children || [];
  
    floors.forEach(floor => {
      // A floor is visible if it has an event OR any of its rooms have an event.
      const floorHasEvent = roomIdsWithEvents.has(floor.id);
      const roomsWithEvents = floor.children?.filter(room => roomIdsWithEvents.has(room.id)) || [];
      const floorHasVisibleRooms = roomsWithEvents.length > 0;
  
      if (floorHasEvent || floorHasVisibleRooms) {
        visibleTree.push(floor);
        roomsWithEvents.forEach(room => {
          visibleTree.push(room);
        });
      }
    });
  
    return visibleTree;
  }, [initialRooms, visibleEvents]);


  if (!isMounted) {
      return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <TimelineHeader
        zoom={zoom}
        onZoomChange={handleZoomChange}
        dateRange={dateRange}
        onNavigate={handleNavigate}
        visibleSources={visibleSources}
        onVisibleSourcesChange={setVisibleSources}
      />
        <div className="flex-grow mt-4 rounded-lg shadow-sm overflow-hidden">
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
