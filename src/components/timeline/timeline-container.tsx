
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fromParam = searchParams.get('from');
    const zoomParam = searchParams.get('zoom') as ZoomLevel;

    if (zoomParam) {
        setZoom(zoomParam);
    }
    if (fromParam) {
        const parsedDate = parse(fromParam, 'yyyy-MM-dd', new Date());
        setCurrentDate(parsedDate);
    } else {
        setCurrentDate(new Date());
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMounted) {
        const newUrl = `/?zoom=${zoom}&from=${format(currentDate, 'yyyy-MM-dd')}`;
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
  
  const visibleEvents = useMemo(() => {
    return initialEvents.filter(event => {
      const eventStart = parseISO(event.startsAt);
      const eventEnd = parseISO(event.endsAt);
      const eventInterval = { start: eventStart, end: eventEnd };
      return isWithinInterval(eventStart, dateRange) || isWithinInterval(dateRange.start, eventInterval);
    }).map(event => ({
        ...event,
        location: event.location || 'frontier-tower',
    }));
  }, [initialEvents, dateRange]);
  
  const flattenedVisibleRooms = useMemo(() => {
    const roomIdsWithEvents = new Set(visibleEvents.map(event => event.location));

    const flatten = (node: Room, arr: Room[]) => {
      const hasVisibleChild = node.children?.some(child => 
        child.type === 'floor' 
          ? child.children?.some(room => roomIdsWithEvents.has(room.id)) 
          : roomIdsWithEvents.has(child.id)
      );

      if (node.type === 'building') {
        arr.push(node);
        node.children?.forEach(floor => {
          const floorHasVisibleRooms = floor.children?.some(room => roomIdsWithEvents.has(room.id));
          if (floorHasVisibleRooms) {
            arr.push(floor);
            floor.children?.forEach(room => {
              if (roomIdsWithEvents.has(room.id)) {
                arr.push(room);
              }
            });
          }
        });
      }
    };
    
    const visibleTree: Room[] = [];
    if (initialRooms) {
      // Always show the building itself, especially for events with no location
      if (visibleEvents.length === 0 && !roomIdsWithEvents.has('frontier-tower')) {
        const buildingOnly: Room = {...initialRooms, children: []};
        visibleTree.push(buildingOnly);
        return visibleTree;
      }
      
      const buildingNode = {...initialRooms};
      const floorsWithEvents = buildingNode.children?.filter(floor => 
        floor.children?.some(room => roomIdsWithEvents.has(room.id))
      ) || [];
      
      visibleTree.push(buildingNode);

      if(floorsWithEvents.length > 0) {
        floorsWithEvents.forEach(floor => {
          visibleTree.push(floor);
          const roomsWithEvents = floor.children?.filter(room => roomIdsWithEvents.has(room.id)) || [];
          roomsWithEvents.forEach(room => {
            visibleTree.push(room);
          });
        });
      }
    }
    
    return visibleTree;
}, [initialRooms, visibleEvents]);


  if (!isMounted) {
      return null;
  }

  return (
    <div className="p-4">
      <TimelineHeader
        zoom={zoom}
        onZoomChange={handleZoomChange}
        dateRange={dateRange}
        onNavigate={handleNavigate}
      />
        <div className="mt-4 rounded-lg shadow-sm">
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
