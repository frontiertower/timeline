
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
} from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineViewProps {
  events: Event[];
  dateRange: { start: Date; end: Date };
  zoom: ZoomLevel;
  flattenedRooms: Room[];
  onZoomChange: (zoom: ZoomLevel) => void;
  onDateChange: (date: Date) => void;
}

export function TimelineView({ events, dateRange, zoom, flattenedRooms, onZoomChange, onDateChange }: TimelineViewProps) {
  
  const getGridTemplateColumns = () => {
    switch (zoom) {
      case 'day': return `repeat(48, minmax(2rem, 1fr))`; // 48 slots for 30-min intervals
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
    const roomIndex = flattenedRooms.findIndex(r => r.id === event.location);
    if (roomIndex === -1) return null;

    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);

    let gridColumnStart, gridColumnEnd;
    const totalColumns = zoom === 'day' ? 48 : timeSlots.length;

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
      gridRow: roomIndex + 2, // +2 because of header row
      gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
    };
  };

  const handleTimeSlotClick = (date: Date) => {
    if (zoom === 'week' || zoom === 'month') {
        onDateChange(date);
        onZoomChange('day');
    }
  }
  
  const DayViewHeader = () => (
    <div className="grid sticky top-0 z-10 bg-card" style={{ gridTemplateColumns: `repeat(24, minmax(4rem, 1fr))` }}>
      {timeSlots.map(({ label, date }) => (
        <div key={label} className="flex-shrink-0 text-center p-2 text-sm font-medium text-muted-foreground h-12 flex items-center justify-center border-b relative">
            {label}
            <Separator orientation="vertical" className="absolute right-0 top-1/4 h-1/2 bg-border/50" />
        </div>
      ))}
    </div>
  );

  const OtherViewHeader = () => (
     <div className="grid sticky top-0 z-10 bg-card" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
        {timeSlots.map(({ label, date }) => (
          <div key={label} className={cn("flex-shrink-0 text-center p-2 text-sm font-medium text-muted-foreground h-12 flex items-center justify-center border-b", (zoom === 'week' || zoom === 'month') && "cursor-pointer hover:bg-muted")}
            onClick={() => handleTimeSlotClick(date)}
          >
            {label}
          </div>
        ))}
    </div>
  )

  return (
    <ScrollArea className="w-full rounded-b-lg">
      <div className="flex relative">
        <RoomList flattenedRooms={flattenedRooms} />
        <div className="flex-1 relative overflow-x-auto">
          {/* Header */}
          {zoom === 'day' ? <DayViewHeader /> : <OtherViewHeader />}

          {/* Grid and Events */}
          <div className="grid" style={{ gridTemplateColumns: getGridTemplateColumns(), gridTemplateRows: `repeat(${flattenedRooms.length}, 3rem)` }}>
              {/* This is just to create the grid structure, no content needed */}
              {flattenedRooms.map((_, roomIndex) => (
                timeSlots.map((__, timeIndex) => {
                  const columns = zoom === 'day' ? 48 : timeSlots.length;
                  return Array.from({length: zoom === 'day' ? 2 : 1}).map((___, subIndex) => (
                     <div key={`${roomIndex}-${timeIndex}-${subIndex}`} className="h-12"></div>
                  ))
                })
              ))}

              {events.map(event => {
                  const position = getEventGridPosition(event);
                  if (!position) return null;
                  
                  return (
                      <div 
                        key={event.id} 
                        style={{ gridRow: position.gridRow -1, gridColumn: position.gridColumn }} 
                        className="p-1 h-12 relative"
                      >
                          <EventItem event={event} />
                      </div>
                  ) 
              })}
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
