'use client';

import type { Event, Room } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
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

const getVisibleRoomsAndIds = (rooms: Room, visibleEventRoomIds: Set<string>): [Room, Set<string>] => {
  const visibleRoomIds = new Set<string>();

  const filterRooms = (node: Room): Room | null => {
    const hasVisibleEvents = visibleEventRoomIds.has(node.id);
    let isParentOfVisible = false;

    const visibleChildren = node.children?.map(filterRooms).filter(Boolean) as Room[] | undefined;

    if (visibleChildren && visibleChildren.length > 0) {
      isParentOfVisible = true;
    }

    if (hasVisibleEvents || isParentOfVisible) {
      visibleRoomIds.add(node.id);
      if (node.children) {
        node.children.forEach(child => visibleRoomIds.add(child.id));
      }
      return {
        ...node,
        children: visibleChildren,
      };
    }
    return null;
  };
  
  const rootClone = JSON.parse(JSON.stringify(rooms));
  const filteredRoot = filterRooms(rootClone);

  if (filteredRoot) {
     (filteredRoot.children || []).forEach(floor => {
        visibleRoomIds.add(floor.id);
        (floor.children || []).forEach(room => {
            if (visibleEventRoomIds.has(room.id)) {
                visibleRoomIds.add(room.id);
            }
        });
     });
  }

  // A new function to prune the tree
  const pruneTree = (node: Room, visibleIds: Set<string>): Room | null => {
    const isVisible = visibleIds.has(node.id);
    
    if (!node.children) {
      return isVisible ? node : null;
    }

    const newChildren = node.children
      .map(child => pruneTree(child, visibleIds))
      .filter((child): child is Room => child !== null);

    if (newChildren.length > 0 || node.type !== 'room') {
      return { ...node, children: newChildren };
    }

    return null;
  };

  const visibleRoomIdsWithParents = new Set<string>();
  const getParents = (roomId: string, allRooms: Room) => {
      let current: Room | undefined = undefined;
      const findRoom = (node: Room, id: string): Room | undefined => {
          if (node.id === id) return node;
          if (node.children) {
              for (const child of node.children) {
                  const found = findRoom(child, id);
                  if (found) return found;
              }
          }
          return undefined;
      }
      current = findRoom(allRooms, roomId);
      while (current) {
          visibleRoomIdsWithParents.add(current.id);
          current = current.parentId ? findRoom(allRooms, current.parentId) : undefined;
      }
  };

  visibleEventRoomIds.forEach(id => getParents(id, rootClone));
  
  const finalPrunedTree = pruneTree(JSON.parse(JSON.stringify(rooms)), visibleRoomIdsWithParents);

  return [finalPrunedTree || rooms, visibleRoomIdsWithParents];
};


export function TimelineContainer({ initialRooms, initialEvents }: TimelineContainerProps) {
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
        node.children.forEach(traverse);
      }
    };
    if (visibleRooms) traverse(visibleRooms);
    return rooms;
  }, [visibleRooms]);

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
            {flattenedVisibleRooms.length > 1 ? (
                <TimelineView
                    rooms={visibleRooms}
                    events={visibleEvents}
                    dateRange={dateRange}
                    zoom={zoom}
                    flattenedRooms={flattenedVisibleRooms}
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
