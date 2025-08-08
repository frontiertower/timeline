import type { Event } from './types';
import { addHours, set, startOfDay } from 'date-fns';

const today = new Date();

const createEvent = (
  id: string,
  name: string,
  description: string,
  startHour: number,
  endHour: number,
  location: string
): Event => {
  const baseTime = startOfDay(today);
  return {
    id,
    name,
    description: `[MOCK] ${description}`,
    startsAt: addHours(baseTime, startHour).toISOString(),
    endsAt: addHours(baseTime, endHour).toISOString(),
    location,
    color: 'hsl(240 4.8% 95.9%)', // Muted gray
  };
};

export const events: Event[] = [
  createEvent(
    'evt-1',
    'Morning Yoga',
    'Start your day with an invigorating yoga session overlooking the city.',
    8,
    9,
    'f16r1'
  ),
  createEvent(
    'evt-2',
    'Tech Conference Keynote',
    'Keynote address for the Annual Tech Innovators Summit.',
    9.5,
    11,
    'f2r1'
  ),
  createEvent(
    'evt-3',
    'AI Workshop',
    'Hands-on workshop on the latest in Artificial Intelligence.',
    11.5,
    13,
    'f2r2'
  ),
  createEvent(
    'evt-4',
    'Networking Lunch',
    'A chance to connect with fellow attendees and speakers.',
    13,
    14,
    'floor_3'
  ),
  createEvent(
    'evt-5',
    'VR/AR Demo Session',
    'Experience the future with our VR/AR demos.',
    14.5,
    16,
    'floor_16'
  ),
  createEvent(
    'evt-6',
    'Evening Mixer',
    'Relax and unwind at our exclusive evening mixer.',
    18,
    20,
    'floor_16'
  ),
  createEvent(
    '243',
    'Stargazing Night',
    'Join us for a magical night of stargazing.',
    21,
    22,
    'floor_16'
  ),
];
