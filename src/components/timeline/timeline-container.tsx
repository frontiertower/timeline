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

  const flattenedVisibleRooms = useMemo(() => {
    const roomIdsWithEvents = new Set(visibleEvents.map(event => event.location));
    
    const visibleRooms: Room[] = [];
    const traverse = (node: Room, isVisible: (id: string) => boolean) => {
        const hasVisibleChildren = node.children && node.children.some(child => {
            if (child.type === 'room') return isVisible(child.id);
            // This is a simplistic check. For deeper nesting, a recursive check would be needed.
            // For now, assuming floors contain rooms and checking if any of those rooms are visible.
            return child.children && child.children.some(room => room.type === 'room' && isVisible(room.id));
        });

        if (node.type === 'building' || hasVisibleChildren) {
            visibleRooms.push(node);
            if (node.children) {
                node.children.forEach(child => {
                    if (child.type === 'room' && isVisible(child.id)) {
                        visibleRooms.push(child);
                    } else if (child.type === 'floor') {
                        // Recursively call traverse to check visibility of floor's children
                        traverse(child, isVisible);
                    }
                });
            }
        }
    };

    if (initialRooms) {
        // A new tree traversal that filters based on event visibility
        const rooms: Room[] = [];
        const filterAndFlatten = (node: Room) => {
            const childrenWithEvents = node.children ? node.children.map(child => {
                // If a child is a room, it must have events
                if (child.type === 'room') {
                    return roomIdsWithEvents.has(child.id) ? child : null;
                }
                // If a child is a floor, it must have rooms with events
                if (child.type === 'floor') {
                    const visibleRooms = child.children ? child.children.filter(room => roomIdsWithEvents.has(room.id)) : [];
                    if (visibleRooms.length > 0) {
                        return { ...child, children: visibleRooms };
                    }
                }
                return null;
            }).filter(Boolean) as Room[] : [];

            if (node.type === 'building' || childrenWithEvents.length > 0) {
                 rooms.push({ ...node, children: childrenWithEvents });
            }
        };

        const flatten = (node: Room, arr: Room[]) => {
            arr.push(node);
            if (node.children) {
                node.children.forEach(child => flatten(child, arr));
            }
        };

        const visibleTree: Room[] = [];
        if (initialRooms.children) {
            const buildingNode = {...initialRooms, children: []}; // Clone building node
            initialRooms.children.forEach(floor => {
                const roomsInFloor = floor.children ? floor.children.filter(room => roomIdsWithEvents.has(room.id)) : [];
                if(roomsInFloor.length > 0) {
                    buildingNode.children.push({...floor, children: roomsInFloor});
                }
            });
            if(buildingNode.children.length > 0) {
              flatten(buildingNode, visibleTree);
            } else if (visibleEvents.length === 0) {
              // If no events, show all rooms
              flatten(initialRooms, visibleTree);
              return visibleTree;
            } else {
              // Case where events might be on locations not in the tree? Unlikely but safe.
              // Show building only.
              visibleTree.push({...initialRooms, children: []});
            }

        } else if (roomIdsWithEvents.has(initialRooms.id)) {
            visibleTree.push(initialRooms);
        }
        
        return visibleTree;
    }
    return [];
  }, [initialRooms, visibleEvents]);


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
            {flattenedVisibleRooms.length > 0 ? (
                <TimelineView
                    rooms={initialRooms}
                    events={visibleEvents}
                    dateRange={dateRange}
                    zoom={zoom}
                    flattenedRooms={flattenedVisibleRooms}
                    eventRooms={eventRooms}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>No events scheduled for this period.</p>
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
