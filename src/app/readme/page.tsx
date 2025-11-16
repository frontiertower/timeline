
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GitBranch, Calendar, Merge, Palette, MessageSquare } from 'lucide-react';
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
              <ul className="list-disc list-inside space-y-3">
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Dual Calendar Sources:</strong> The timeline aggregates events from two real-time sources: Frontier Tower's internal calendar and public Luma calendars, providing a comprehensive schedule.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Color-Coded Events:</strong> To make sources easily distinguishable, events from the <b className="text-primary">Frontier Tower</b> calendar are shown in purple, while events from <b style={{color: "hsl(0 100% 60%)"}}>Luma</b> are shown in red. Mock events for demonstration are grey.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><Merge className="h-5 w-5 text-primary" /> Smart Deduplication:</strong> The application intelligently detects and merges duplicate events that appear on both calendars with the same name and similar times, presenting them as a single entry to avoid clutter.
                </li>
                <li>
                  <strong className="font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" /> Smart Filtering:</strong> The timeline automatically hides rooms and floors that have no scheduled events within the current time window, providing a clean and focused view.
                </li>
              </ul>
            </div>
            <p>
              This application was built to demonstrate best practices in modern web development, including responsive design, server-side data fetching, and interactive UI components. Explore the timeline to see it in action!
            </p>
            <div className="rounded-lg bg-muted p-4 flex items-center gap-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Have feedback or see an issue?</p>
                    <p className="text-sm">Please contact Sameer on Telegram at <a href="https://t.me/SxP256" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">t.me/SxP256</a>.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
