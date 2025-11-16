
'use client';

import type { Event } from '@/lib/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, isBefore, parseISO } from 'date-fns';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventItemProps {
  event: Event;
  group?: Event[];
}

export function EventItem({ event, group = [] }: EventItemProps) {
  const isGroup = group.length > 1;
  const eventEnd = parseISO(event.endsAt);
  const isPast = isBefore(eventEnd, new Date());

  let cardStyle: React.CSSProperties = {};
  
  if (isPast) {
    cardStyle = {
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
    };
  } else if (isGroup) {
    cardStyle = {
      backgroundColor: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      border: '1px dashed hsl(var(--border))',
    };
  } else {
     cardStyle = {
        backgroundColor: event.color,
        color: 'hsl(var(--primary-foreground))',
    };
  }

  const eventName = isGroup ? `${group.length} Events` : event.name;
  const eventId = isGroup ? group.map(e => e.id).join(',') : event.id;

  const TooltipText = () => {
    if (isGroup) {
      return (
        <>
          <p className="font-bold">Multiple Events</p>
          <ul className="list-disc list-inside">
            {group.map(e => <li key={e.id}>{e.name}</li>)}
          </ul>
           <p className="text-sm text-muted-foreground mt-2">
            Click to see details for all events.
          </p>
        </>
      )
    }
    return (
      <>
        <p className="font-bold">{event.name}</p>
        <p className="text-sm text-muted-foreground">
          <b>{format(new Date(event.startsAt), 'p')}</b> - <b>{format(new Date(event.endsAt), 'p')}</b>
        </p>
        {event.description.substring(0,50)}{event.description.length > 50 ? '...' : ''}
      </>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/events/${eventId}`} className="block h-full">
            <Card 
              className={cn(
                  "h-full w-full hover:opacity-80 transition-opacity duration-200 shadow-md overflow-hidden",
                  isPast && "grayscale opacity-70"
              )}
              style={cardStyle}
            >
              <CardHeader className="p-2 flex-row items-center gap-2">
                {isGroup && <Users className="h-4 w-4 shrink-0" />}
                <CardTitle className="text-xs font-bold truncate">
                  {eventName}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipText />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
