'use client';

import type { Room } from '@/lib/types';
import { Building, DoorOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoomListProps {
  rootRoom: Room;
  flattenedRooms: Room[];
}

export function RoomList({ rootRoom, flattenedRooms }: RoomListProps) {

  const renderRoomRows = (rooms: Room[]) => {
      return rooms.map(room => {
        if (room.type === 'room') {
            return (
              <div 
                key={room.id} 
                className="flex items-center gap-2 h-12 px-2 text-sm border-b"
                style={{ paddingLeft: '2rem' }}
              >
                  <DoorOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{room.name}</span>
              </div>
            )
        }
//        return null;
        
        const isFloorWithVisibleRooms = room.type === 'floor' && room.children && room.children.length > 0;

        if (room.type === 'building' || isFloorWithVisibleRooms) {
          const rowStyle = room.type === 'floor' 
            ? "font-bold text-base pt-2 border-b" 
            : "font-extrabold text-lg";
          const padding = room.type === 'floor' ? '1rem' : undefined;

          return (
            <div key={room.id} className={cn("flex items-center gap-2 p-2", rowStyle)} style={{paddingLeft: padding}}>
              {room.type === 'building' && <Building className="h-5 w-5 shrink-0" />}
              {room.type === 'floor' && <ChevronRight className="h-4 w-4 shrink-0" />}
              <span className="truncate">{room.name}</span>
            </div>
          )
        }

        return null;
      });
  }
  
  return (
    <div className="w-64 border-r bg-card sticky left-0 shrink-0">
      <div className="h-12 flex items-center p-2 border-b text-sm font-medium sticky top-0 bg-card z-20">
         <Building className="h-4 w-4 mr-2"/> Location
      </div>
      <ScrollArea className="h-[calc(100%-3rem)]">
         {renderRoomRows(flattenedRooms)}
      </ScrollArea>
    </div>
  );
}
