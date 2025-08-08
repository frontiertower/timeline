import type { Event } from './types';

export const events: Event[] = [
  {
    id: 'evt-1',
    title: 'Morning Yoga',
    description:
      'Start your day with invigorating yoga session overlooking the city.',
    startsAt: '2025-09-05T08:00:00.000Z',
    endsAt: '2025-09-05T09:00:00.000Z',
    location: {
      roomId: 'f1r2', // Gym
    },
  },
  {
    id: 'evt-2',
    title: 'Tech Conference Keynote',
    description: 'Keynote address for the Annual Tech Innovators Summit.',
    startsAt: '2025-09-05T09:30:00.000Z',
    endsAt: '2025-09-05T11:00:00.000Z',
    location: {
      roomId: 'f2r1', // Conference Room Alpha
    },
  },
  {
    id: 'evt-3',
    title: 'AI Workshop',
    description:
      'Hands-on workshop on the latest in Artificial Intelligence.',
    startsAt: '2025-09-05T11:30:00.000Z',
    endsAt: '2025-09-05T13:00:00.000Z',
    location: {
      roomId: 'f2r2', // Conference Room Beta
    },
  },
  {
    id: 'evt-4',
    title: 'Networking Lunch',
    description: 'A chance to connect with fellow attendees and speakers.',
    startsAt: '2025-09-05T13:00:00.000Z',
    endsAt: '2025-09-05T14:00:00.000Z',
    location: {
      roomId: 'f1r1', // Lobby
    },
  },
  {
    id: 'evt-5',
    title: 'VR/AR Demo Session',
    description: 'Experience the future with our VR/AR demos.',
    startsAt: '2025-09-05T14:30:00.000Z',
    endsAt: '2025-09-05T16:00:00.000Z',
    location: {
      roomId: 'f2r3', // Breakout Zone 1
    },
  },
  {
    id: 'evt-6',
    title: 'Evening Mixer',
    description: 'Relax and unwind at our exclusive evening mixer.',
    startsAt: '2025-09-05T18:00:00.000Z',
    endsAt: '2025-09-05T20:00:00.000Z',
    location: {
      roomId: 'f3r1', // Sky Lounge Bar
    },
  },
  {
    id: 'evt-7',
    title: 'Stargazing Night',
    description: 'Join us for a magical night of stargazing.',
    startsAt: '2025-09-05T21:00:00.000Z',
    endsAt: '2025-09-05T22:00:00.000Z',
    location: {
      roomId: 'f3r2', // Observatory Deck
    },
  },
];
