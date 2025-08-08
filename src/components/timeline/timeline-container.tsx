'use client';

import type { Event, Room } from '@/lib/types';
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
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { TimelineHeader } from './timeline-header';
import { TimelineView } from './timeline-view';
import { Card, CardContent } from '@/components/ui/card';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineContainerProps {
  initialRooms: Room;
  initialEvents: Event[];
}


const findRoom = (roomId: string, root: Room): Room | null => {
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

const getVisibleRoomsAndIds = (
    allRooms: Room,
    visibleEventRoomIds: Set<string>
): [Room, Set<string>] => {
    const visibleIds = new Set<string>();

    const addParents = (roomId: string) => {
        let current = findRoom(roomId, allRooms);
        while (current) {
            visibleIds.add(current.id);
            current = current.parentId ? findRoom(current.parentId, allRooms) : null;
        }
    };
    
    visibleEventRoomIds.forEach(id => addParents(id));

    const filterTree = (node: Room): Room | null => {
        if (!visibleIds.has(node.id)) {
            return null;
        }

        const filteredChildren = node.children
            ?.map(child => filterTree(child))
            .filter((child): child is Room => child !== null);
        
        // Hide floors that have no visible rooms under them
        if (node.type === 'floor' && (!filteredChildren || filteredChildren.length === 0)) {
            return null;
        }

        return {
            ...node,
            children: filteredChildren,
        };
    };
    
    const visibleTree = filterTree(JSON.parse(JSON.stringify(allRooms)));

    return [visibleTree || allRooms, visibleIds];
};

function TimelineContainerComponent({ initialRooms, initialEvents }: TimelineContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2025-09-05T10:00:00.000Z'));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fromParam = searchParams.get('from');
    const zoomParam = searchParams.get('zoom') as ZoomLevel;

    if (zoomParam) {
        setZoom(zoomParam);
    }
    if (fromParam) {
        setCurrentDate(parseISO(fromParam));
    } else {
        setCurrentDate(new Date('2025-09-05T10:00:00.000Z'));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMounted) {
        const newUrl = `/?zoom=${zoom}&from=${currentDate.toISOString()}`;
        window.history.pushState({}, '', newUrl);
    }
  }, [zoom, currentDate, isMounted]);

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

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = {
      day: direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1),
      week: direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1),
      month: direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1),
    }[zoom];
    setCurrentDate(newDate);
  };
  
  const visibleEvents = useMemo(() => {
    return initialEvents.filter(event => {
      const eventStart = parseISO(event.startsAt);
      const eventEnd = parseISO(event.endsAt);
      const eventInterval = { start: eventStart, end: eventEnd };
      return isWithinInterval(eventStart, dateRange) || isWithinInterval(dateRange.start, eventInterval);
    });
  }, [initialEvents, dateRange]);


  const [visibleRooms, visibleRoomIds] = useMemo(() => {
    const visibleEventRoomIds = new Set(visibleEvents.map(e => e.location));
    const [tree, ids] = getVisibleRoomsAndIds(initialRooms, visibleEventRoomIds);
    return [tree, ids];
  }, [initialRooms, visibleEvents]);

  const flattenedVisibleRooms = useMemo(() => {
    const rooms: Room[] = [];
    const traverse = (node: Room) => {
      rooms.push(node);
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };
    if (visibleRooms) traverse(visibleRooms);
    return rooms;
  }, [visibleRooms]);

  const eventRooms = useMemo(() => {
      return flattenedVisibleRooms.filter(r => r.type === 'room');
  }, [flattenedVisibleRooms]);

  if (!isMounted) {
      return null;
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <TimelineHeader
        zoom={zoom}
        onZoomChange={handleZoomChange}
        dateRange={dateRange}
        onNavigate={handleNavigate}
      />
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardContent className="flex-grow p-0 flex">
            {eventRooms.length > 0 ? (
                <TimelineView
                    rooms={visibleRooms}
                    events={visibleEvents}
                    dateRange={dateRange}
                    zoom={zoom}
                    flattenedRooms={flattenedVisibleRooms}
                    eventRooms={eventRooms}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>No events in the selected time range.</p>
                </div>
            )}
        </CardContent>
      </Card>
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
