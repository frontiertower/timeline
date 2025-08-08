import { EventDetail } from '@/components/event-detail';

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  return <EventDetail id={params.id} />;
}
