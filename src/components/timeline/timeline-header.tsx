
'use client';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { FrontierTowerLogo } from '../icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineHeaderProps {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  dateRange: { start: Date; end: Date };
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function TimelineHeader({
  zoom,
  onZoomChange,
  dateRange,
  onNavigate,
}: TimelineHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'MMM d, p'));
    }, 60 * 1000); // Update every minute

    // Set initial time
    setCurrentTime(format(new Date(), 'MMM d, p'));

    return () => clearInterval(timer);
  }, []);


  const formatDateRange = () => {
    switch (zoom) {
      case 'day':
        return format(dateRange.start, 'MMMM d, yyyy');
      case 'week':
        const start = dateRange.start;
        const end = dateRange.end;
        if (isSameMonth(start, end)) {
          return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
        }
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      case 'month':
        return format(dateRange.start, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <FrontierTowerLogo className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-headline text-foreground">Frontier Tower Timeline</h1>
          <p className="text-sm text-muted-foreground">
            (
            <Link href="https://ft0.sh/timeline" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ft0.sh/timeline
            </Link>
            )
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {currentTime && (
          <div className="text-sm font-medium text-muted-foreground pr-4 border-r">
            {currentTime}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center w-48 font-semibold text-foreground">
            {formatDateRange()}
          </div>
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ToggleGroup
          type="single"
          value={zoom}
          onValueChange={(value: ZoomLevel) => value && onZoomChange(value)}
          aria-label="Timeline Zoom Level"
        >
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
        <Button asChild variant="outline" size="icon">
          <Link href="/readme">
            <HelpCircle className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
