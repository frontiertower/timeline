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
import { format } from 'date-fns';

interface EventItemProps {
  event: Event;
}

export function EventItem({ event }: EventItemProps) {
  const cardStyle = {
    backgroundColor: event.color,
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/events/${encodeURIComponent(event.id)}`} className="block h-full">
            <Card 
              className="h-full w-full text-primary-foreground hover:opacity-80 transition-opacity duration-200 shadow-md overflow-hidden"
              style={cardStyle}
            >
              <CardHeader className="p-2">
                <CardTitle className="text-xs font-bold truncate">
                  {event.name}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">{event.name}</p>
          <p className="text-sm text-muted-foreground">
            <b>{format(new Date(event.startsAt), 'p')}</b> - <b>{format(new Date(event.endsAt), 'p')}</b> @  <b>{event.location}</b>
          </p>
          {event.description.substring(0,50)}{event.description.length > 50 ? '...' : ''}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
