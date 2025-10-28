
'use client';

import type { Event, Room } from '@/lib/types';
import { RoomList } from './room-list';
import { EventItem } from './event-item';
import {
  eachHourOfInterval,
  eachDayOfInterval,
  getHours,
  format,
  isSameDay,
  getMinutes,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
  parseISO,
  isToday,
  startOfToday,
} from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMemo, useRef, useEffect } from 'react';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineViewProps {
  events: Event[];
  dateRange: { start: Date; end: Date };
  zoom: ZoomLevel;
  flattenedRooms: Room[];
  onZoomChange: (zoom: ZoomLevel) => void;
  onDateChange: (date: Date) => void;
}

// Group events that occur in the same room and overlap in time
function groupOverlappingEvents(events: Event[]): (Event | (Event & { group: Event[] }))[] {
    const sortedEvents = [...events].sort((a, b) => parseISO(a.startsAt).getTime() - parseISO(b.startsAt).getTime());
    const eventGroups: Map<string, Event[]> = new Map();

    for (const event of sortedEvents) {
        let addedToGroup = false;
        const eventInterval = { start: parseISO(event.startsAt), end: parseISO(event.endsAt) };
        
        for (const [key, group] of eventGroups.entries()) {
            if (!key.startsWith(event.location)) continue;

            const groupRepresentative = group[0];
            const groupInterval = { start: parseISO(groupRepresentative.startsAt), end: parseISO(groupRepresentative.endsAt) };

            if (areIntervalsOverlapping(eventInterval, groupInterval)) {
                group.push(event);
                addedToGroup = true;
                break;
            }
        }

        if (!addedToGroup) {
            // Use a unique key for each group to handle non-overlapping events in the same room
            const groupKey = `${event.location}-${event.id}`;
            eventGroups.set(groupKey, [event]);
        }
    }

    const result: (Event | (Event & { group: Event[] }))[] = [];
    for (const group of eventGroups.values()) {
        if (group.length > 1) {
            // For groups, create a representative event
            const earliestStart = group.reduce((earliest, e) => Math.min(earliest, parseISO(e.startsAt).getTime()), Infinity);
            const latestEnd = group.reduce((latest, e) => Math.max(latest, parseISO(e.endsAt).getTime()), -Infinity);
            
            result.push({
                ...group[0], // Use first event as a template
                id: group.map(e => e.id).join(','),
                name: `${group.length} Events`,
                startsAt: new Date(earliestStart).toISOString(),
                endsAt: new Date(latestEnd).toISOString(),
                group: group,
            });
        } else {
            // Single event
            result.push(group[0]);
        }
    }

    return result;
}

export function TimelineView({ events, dateRange, zoom, flattenedRooms, onZoomChange, onDateChange }: TimelineViewProps) {
  
  const processedEvents = useMemo(() => groupOverlappingEvents(events), [events]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const getGridTemplateColumns = () => {
    switch (zoom) {
      case 'day': return `repeat(48, minmax(2rem, 1fr))`; // 48 slots for 30-min intervals
      case 'week': return `repeat(7, minmax(8rem, 1fr))`;
      case 'month': return `repeat(${new Date(dateRange.end.getFullYear(), dateRange.end.getMonth() + 1, 0).getDate()}, minmax(4rem, 1fr))`;
    }
  };

  const timeSlots = getTimeSlots();

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
  
    const timer = setTimeout(() => {
      scrollEl.scrollLeft = scrollEl.scrollWidth;
    }, 100); 
  
    return () => clearTimeout(timer);
  }, [zoom, dateRange, timeSlots.length]);


  const getEventGridPosition = (event: Event) => {
    const roomIndex = flattenedRooms.findIndex(r => r.id === event.location);
    if (roomIndex === -1) return null;

    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);

    let gridColumnStart, gridColumnEnd;
    const totalColumns = timeSlots.length;

    switch (zoom) {
      case 'day':
        const startMinutes = getHours(start) * 60 + getMinutes(start);
        const endMinutes = getHours(end) * 60 + getMinutes(end);
        
        gridColumnStart = isBefore(start, dateRange.start) ? 1 : Math.floor(startMinutes / 30) + 1;
        gridColumnEnd = isAfter(end, dateRange.end) ? totalColumns + 1 : Math.ceil(endMinutes / 30) + 1;

        if (isAfter(start, dateRange.end) || isBefore(end, dateRange.start)) {
          return null;
        }

        break;
      case 'week':
      case 'month':
        let startIndex = timeSlots.findIndex(slot => isSameDay(slot.date, start));
        let endIndex = timeSlots.findIndex(slot => isSameDay(slot.date, end));
        
        gridColumnStart = isBefore(start, dateRange.start) ? 1 : startIndex + 1;
        gridColumnEnd = isAfter(end, dateRange.end) ? totalColumns + 1 : endIndex + 2;

        if (gridColumnStart === 0 && isAfter(end, dateRange.start)) {
          gridColumnStart = 1;
        }
        if (gridColumnEnd === 1 && isBefore(start, dateRange.end)) {
            gridColumnEnd = totalColumns + 1;
        }
        
        break;
    }
    
    if (!gridColumnStart || gridColumnStart > gridColumnEnd) {
      return null;
    }

    return {
      gridRow: roomIndex + 2, // +2 because header is 1, grid starts at 2
      gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
    };
  };

  const getTimeSlots = () => {
    switch (zoom) {
      case 'day':
        return eachHourOfInterval(dateRange).flatMap(hour => [
          { label: format(hour, 'ha'), date: hour },
          { label: '', date: new Date(hour.getTime() + 30 * 60000) }
        ]);
      case 'week':
        return eachDayOfInterval(dateRange).map(day => ({
          label: format(day, 'EEE d'),
          date: day,
        }));
      case 'month':
        return eachDayOfInterval(dateRange).map(day => ({
          label: format(day, 'd'),
          date: day,
        }));
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    if (zoom === 'week' || zoom === 'month') {
        onDateChange(date);
        onZoomChange('day');
    }
  }
  
  const DayViewHeader = () => (
    <div className="grid sticky top-0 z-10 bg-card" style={{ gridTemplateColumns: `repeat(24, minmax(4rem, 1fr))` }}>
      {eachHourOfInterval({start: dateRange.start, end: dateRange.end}).map((hour) => (
        <div key={hour.toString()} className="flex-shrink-0 text-center p-2 text-sm font-medium text-muted-foreground h-12 flex items-center justify-center border-b border-r">
            {format(hour, 'ha')}
        </div>
      ))}
    </div>
  );

  const OtherViewHeader = () => (
     <div className="grid sticky top-0 z-10 bg-card" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
        {timeSlots.map(({ label, date }) => {
            const isPast = isBefore(date, startOfToday()) && !isToday(date);
            return (
                <div key={label + date.toString()} className={cn(
                    "flex-shrink-0 text-center p-2 text-sm font-medium h-12 flex items-center justify-center border-b border-r",
                    (zoom === 'week' || zoom === 'month') && "cursor-pointer hover:bg-muted",
                    isToday(date) && "font-bold text-primary",
                    isPast ? "text-muted-foreground/50" : "text-muted-foreground"
                )}
                    onClick={() => handleTimeSlotClick(date)}
                >
                    {label}
                </div>
            );
        })}
    </div>
  )

  const gridWidth = zoom === 'day' ? '96rem' : zoom === 'week' ? '56rem' : '124rem';

  return (
    <div className="flex flex-1">
      <RoomList flattenedRooms={flattenedRooms} />
      <div className="flex-1 min-w-0">
        <ScrollArea className="h-full" viewportRef={scrollContainerRef}>
          <div className="relative" style={{ width: gridWidth }}>
            <div className="sticky top-0 z-10 bg-card">
              {zoom === 'day' ? <DayViewHeader /> : <OtherViewHeader />}
            </div>
            
            <div className="grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
              {flattenedRooms.map((room, roomIndex) => (
                <div
                  key={room.id}
                  className="grid h-12"
                  style={{
                    gridColumn: '1 / -1',
                    gridRow: `${roomIndex + 1} / ${roomIndex + 2}`,
                    gridTemplateColumns: getGridTemplateColumns(),
                  }}
                >
                  {timeSlots.map((slot, slotIndex) => (
                    <div
                      key={`${room.id}-${slotIndex}`}
                      className="h-12 border-b border-r"
                    />
                  ))}
                </div>
              ))}

              {processedEvents.map(event => {
                const position = getEventGridPosition(event);
                if (!position) return null;

                const roomIndex = flattenedRooms.findIndex(r => r.id === event.location);
                if (roomIndex === -1) return null;

                const groupedEvent = event as Event & { group?: Event[] };

                return (
                  <div
                    key={event.id}
                    style={{
                      gridRowStart: roomIndex + 1,
                      gridRowEnd: roomIndex + 2,
                      gridColumn: position.gridColumn,
                    }}
                    className="p-1 h-12 relative"
                  >
                    <EventItem event={event} group={groupedEvent.group} />
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
