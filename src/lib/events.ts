
import type { Event } from './types';
import { addHours } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const timeZone = 'America/Los_Angeles';

// Get the current date and time in the target timezone.
const nowInPST = toZonedTime(new Date(), timeZone);

// Get the start of today in the target timezone.
const year = nowInPST.getFullYear();
const month = nowInPST.getMonth();
const day = nowInPST.getDate();
const startOfTodayInPST = new Date(year, month, day);


const createEvent = (
  id: string,
  name: string,
  description: string,
  startHour: number,
  endHour: number,
  location: string
): Event => {
  return {
    id,
    name,
    description: `[MOCK] ${description}`,
    startsAt: addHours(startOfTodayInPST, startHour).toISOString(),
    endsAt: addHours(startOfTodayInPST, endHour).toISOString(),
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
