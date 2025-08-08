
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GitBranch, Calendar, Clock, Palette } from 'lucide-react';
import Link from 'next/link';

export default function ReadmePage() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Timeline
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-headline">About the Frontier Tower Timeline</CardTitle>
            <CardDescription className="text-lg pt-2">
              An interactive, real-time event scheduling application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-base leading-relaxed">
            <p>
              Welcome to the Frontier Tower Timeline, a dynamic and visually-driven application designed to showcase events happening across a multi-story building. This project demonstrates a modern, full-stack web application built with Next.js, React, and Tailwind CSS, featuring a real-time, zoomable timeline interface.
            </p>
            <div className="space-y-4">
              <h3 className="text-2xl font-headline font-semibold">Key Features</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Dynamic Timeline View:</strong> Navigate events with three zoom levels: day, week, and month. The interface is fully scrollable, both horizontally and vertically, to easily explore the schedule.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Real-Time Event Data:</strong> Event information is fetched from a live API, ensuring the schedule is always up-to-date. Mock events are also included for demonstration and are dynamically set to the current date.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" /> Smart Filtering:</strong> The timeline intelligently hides rooms and floors that have no scheduled events within the current time window, providing a clean and focused view.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Color-Coded Events:</strong> Real events are highlighted in purple, while mock or placeholder events are styled in a muted grey, allowing for easy visual distinction.
                </li>
              </ul>
            </div>
            <p>
              This application was built to demonstrate best practices in modern web development, including responsive design, server-side data fetching, and interactive UI components. Explore the timeline to see it in action!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
