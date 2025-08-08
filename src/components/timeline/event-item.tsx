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
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/events/${event.id}`} className="block h-full">
            <Card className="h-full w-full bg-primary/80 text-primary-foreground hover:bg-primary transition-colors duration-200 shadow-md overflow-hidden">
              <CardHeader className="p-2">
                <CardTitle className="text-xs font-bold truncate">
                  {event.title}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">{event.title}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.startsAt), 'p')} - {format(new Date(event.endsAt), 'p')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
