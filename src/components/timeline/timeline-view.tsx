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
} from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  rooms: Room;
  events: Event[];
  dateRange: { start: Date; end: Date };
  zoom: 'day' | 'week' | 'month';
  flattenedRooms: Room[];
  eventRooms: Room[];
}

export function TimelineView({ rooms, events, dateRange, zoom, flattenedRooms, eventRooms }: TimelineViewProps) {
  
  const getGridTemplateColumns = () => {
    switch (zoom) {
      case 'day': return `repeat(24, minmax(4rem, 1fr))`;
      case 'week': return `repeat(7, minmax(8rem, 1fr))`;
      case 'month': return `repeat(${new Date(dateRange.end.getFullYear(), dateRange.end.getMonth() + 1, 0).getDate()}, minmax(4rem, 1fr))`;
    }
  };

  const getTimeSlots = () => {
    switch (zoom) {
      case 'day':
        return eachHourOfInterval(dateRange).map(hour => ({
          label: format(hour, 'ha'),
          date: hour,
        }));
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
  const timeSlots = getTimeSlots();

  const getEventGridPosition = (event: Event) => {
    const roomIndex = eventRooms.findIndex(r => r.id === event.location);
    if (roomIndex === -1) return null;

    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);

    let gridColumnStart, gridColumnEnd;

    switch (zoom) {
      case 'day':
        const startMinutes = getHours(start) * 60 + getMinutes(start);
        const endMinutes = getHours(end) * 60 + getMinutes(end);
        gridColumnStart = Math.floor(startMinutes / 60) + 1;
        gridColumnEnd = Math.ceil(endMinutes / 60) + 1;
        break;
      case 'week':
        gridColumnStart = timeSlots.findIndex(slot => isSameDay(slot.date, start)) + 1;
        gridColumnEnd = timeSlots.findIndex(slot => isSameDay(slot.date, end)) + 1;
        if(gridColumnEnd === 0) gridColumnEnd = timeSlots.length + 1; // span to end if not in view
        if(gridColumnStart === 0 && gridColumnEnd > 0) gridColumnStart = 1;
        break;
      case 'month':
         gridColumnStart = timeSlots.findIndex(slot => isSameDay(slot.date, start)) + 1;
         gridColumnEnd = timeSlots.findIndex(slot => isSameDay(slot.date, end)) + 1;
         if(gridColumnEnd === 0) gridColumnEnd = timeSlots.length + 1;
         if(gridColumnStart === 0 && gridColumnEnd > 0) gridColumnStart = 1;
        break;
    }
    
    if (gridColumnStart === 0) return null;

    return {
      gridRow: roomIndex + 1,
      gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
    };
  };

  return (
    <div className="flex flex-1 min-h-0">
      <RoomList rootRoom={rooms} flattenedRooms={flattenedRooms} />
      <ScrollArea className="flex-1 whitespace-nowrap">
        <div className="relative h-full">
          <div className="sticky top-0 z-10 bg-card">
            <div className="grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
              {timeSlots.map(({ label, date }) => (
                <div key={label} className="flex-shrink-0 text-center p-2 border-b border-r text-sm font-medium text-muted-foreground h-12 flex items-center justify-center">
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="grid h-full" style={{ gridTemplateColumns: getGridTemplateColumns(), gridTemplateRows: `repeat(${eventRooms.length}, 3rem)` }}>
            {/* Grid lines & Rows */}
            {eventRooms.map((room, i) =>
              {
                return (
                    // Render grid cells for room rows
                    timeSlots.map((_, j) => (
                        <div key={`${room.id}-${j}`} className={cn("border-r border-b h-12", (i + j) % 2 === 0 ? "bg-muted/30" : "")}></div>
                    ))
                )
              }
            )}
            {/* Events */}
            {events.map(event => {
              const position = getEventGridPosition(event);
              return position ? (
                <div key={event.id} style={{ gridRow: position.gridRow, gridColumn: position.gridColumn }} className="p-1 h-12">
                  <EventItem event={event} />
                </div>
              ) : null;
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
