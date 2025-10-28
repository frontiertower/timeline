
'use client';

import type { Room } from '@/lib/types';
import { Building, DoorOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RoomListProps {
  flattenedRooms: Room[];
}

const getLocationUrl = (id: string) => {
  if (id === 'frontier-tower') {
    return 'https://www.google.com/maps/search/?api=1&query=Frontier%20Tower%20%4014th%20floor%20995%20Market%20Street%2C%20San%20Francisco';
  }
  return `https://ft0.sh/where#${id}`;
};

export function RoomList({ flattenedRooms }: RoomListProps) {

  const renderRoomRows = (rooms: Room[]) => {
      return rooms.map(room => {
        const locationUrl = getLocationUrl(room.id);
        const linkContent = (
          <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
            {room.type === 'room' && <DoorOpen color="hsl(259 80% 70%)" className="h-4 w-4 shrink-0 text-muted-foreground" />}
            {room.type === 'building' && <Building color="hsl(259 80% 70%)" className="h-5 w-5 shrink-0" />}
            {room.type === 'floor' && <ChevronRight color="hsl(259 80% 70%)" className="h-4 w-4 shrink-0" />}
            <span className="truncate">{room.name}</span>
          </a>
        );

        if (room.type === 'room') {
            return (
              <div 
                key={room.id} 
                className="flex items-center h-12 px-2 text-sm border-b"
                style={{ paddingLeft: '2rem' }}
              >
                {linkContent}
              </div>
            )
        }
        
        const isFloorWithVisibleRooms = room.type === 'floor';

        if (room.type === 'building' || isFloorWithVisibleRooms) {
          const rowStyle = "font-bold text-base pt-2";
          const padding = room.type === 'floor' ? '1rem' : undefined;

          return (
            <div key={room.id} className={cn("flex items-center p-2 h-12 border-b", rowStyle)} style={{paddingLeft: padding}}>
              {linkContent}
            </div>
          )
        }

        return <div key={room.id} className="h-12 border-b"></div>;
      });
  }
  
  return (
    <div className="w-64 bg-card sticky left-0 z-20 shrink-0 shadow-md">
      <div className="h-12 flex items-center p-2 text-sm font-medium sticky top-0 bg-card z-10 border-b">
        Location
      </div>
       {renderRoomRows(flattenedRooms)}
    </div>
  );
}
