'use client';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { FrontierTowerLogo } from '../icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { EventSource } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineHeaderProps {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  dateRange: { start: Date; end: Date };
  onNavigate: (direction: 'prev' | 'next') => void;
  visibleSources: EventSource[];
  onVisibleSourcesChange: (sources: EventSource[]) => void;
}

export function TimelineHeader({
  zoom,
  onZoomChange,
  dateRange,
  onNavigate,
  visibleSources,
  onVisibleSourcesChange
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
  
  const handleSourceChange = (source: EventSource, checked: boolean) => {
    const newSources = checked
      ? [...visibleSources, source]
      : visibleSources.filter(s => s !== source);
    onVisibleSourcesChange(newSources);
  }

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
      <div className="flex items-center gap-4 flex-wrap justify-center">
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
        
        <div className="flex items-center gap-4 pl-4 border-l">
            <div className="flex items-center space-x-2">
                <Checkbox id="ft-checkbox" checked={visibleSources.includes('frontier-tower')} onCheckedChange={(checked) => handleSourceChange('frontier-tower', !!checked)} style={{'--checkbox-color': 'hsl(259 80% 70%)'} as React.CSSProperties} />
                <Label htmlFor="ft-checkbox">FrontierTower</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="luma-checkbox" checked={visibleSources.includes('luma')} onCheckedChange={(checked) => handleSourceChange('luma', !!checked)} style={{'--checkbox-color': 'hsl(140 50% 60%)'} as React.CSSProperties}/>
                <Label htmlFor="luma-checkbox">Luma</Label>
            </div>
        </div>

        <Button asChild variant="outline" size="icon">
          <Link href="/readme">
            <HelpCircle className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
