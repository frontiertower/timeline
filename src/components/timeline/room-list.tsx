'use client';

import type { Room } from '@/lib/types';
import { Building, DoorOpen, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoomListProps {
  rootRoom: Room;
  flattenedRooms: Room[];
}

const RoomNode = ({ node, level }: { node: Room; level: number }) => {
  const isFloor = node.type === 'floor';
  const hasChildren = node.children && node.children.length > 0;

  const Icon = node.type === 'building' ? Building : isFloor ? ChevronRight : DoorOpen;
  
  if (isFloor && hasChildren) {
    return (
      <AccordionItem value={node.id} className="border-b-0">
        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-1 text-sm font-semibold [&[data-state=open]>svg]:rotate-90">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 transition-transform duration-200" />
                <span>{node.name}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="pl-6 pb-0">
          {node.children?.map(child => <RoomNode key={child.id} node={child} level={level + 1} />)}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div className={cn(
        "flex items-center gap-2 px-2 py-2 text-sm text-foreground", 
        level > 1 && "pl-4"
    )}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{node.name}</span>
    </div>
  );
};


export function RoomList({ rootRoom, flattenedRooms }: RoomListProps) {

  const renderRoomRows = (rooms: Room[]) => {
      return rooms.map(room => (
          <div key={room.id} className={cn("flex items-center gap-2 h-12 px-2 text-sm border-b", room.type === 'floor' && "font-bold", room.type === 'building' && "font-extrabold text-base")}>
              {room.type === 'building' && <Building className="h-4 w-4 shrink-0" />}
              {room.type === 'floor' && <div style={{ paddingLeft: '1rem' }}><ChevronRight className="h-4 w-4 shrink-0" /></div>}
              {room.type === 'room' && <div style={{ paddingLeft: '2rem' }}><DoorOpen className="h-4 w-4 shrink-0 text-muted-foreground" /></div>}
              <span className="truncate">{room.name}</span>
          </div>
      ));
  }
  
  return (
    <div className="w-64 border-r bg-card sticky left-0">
      <div className="h-12 flex items-center p-2 border-b text-sm font-medium sticky top-0 bg-card z-20">
         <Building className="h-4 w-4 mr-2"/> Location
      </div>
      <ScrollArea className="h-[calc(100%-3rem)]">
        <div className="divide-y">
            {renderRoomRows(flattenedRooms)}
        </div>
      </ScrollArea>
    </div>
  );
}
