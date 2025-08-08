import type { Room, Event } from './types';
import { subDays, addDays, addHours, formatISO } from 'date-fns';

const now = new Date('2025-09-05T10:00:00.000Z');

const rawRooms: Omit<Room, 'children'>[] = [
  { id: 'frontier-tower', name: 'Frontier Tower', type: 'building', parentId: null },
  { id: 'floor-1', name: 'Lobby & Conference', type: 'floor', parentId: 'frontier-tower' },
  { id: 'room-101', name: 'Main Lobby', type: 'room', parentId: 'floor-1' },
  { id: 'room-102', name: 'Conference Room A', type: 'room', parentId: 'floor-1' },
  { id: 'room-103', name: 'Conference Room B', type: 'room', parentId: 'floor-1' },
  { id: 'floor-2', name: 'Co-Working & Cafe', type: 'floor', parentId: 'frontier-tower' },
  { id: 'room-201', name: 'Open Co-Working Space', type: 'room', parentId: 'floor-2' },
  { id: 'room-202', name: 'The Grind Cafe', type: 'room', parentId: 'floor-2' },
  { id: 'room-203', name: 'Quiet Pod 1', type: 'room', parentId: 'floor-2' },
  { id: 'floor-3', name: 'Innovation Suites', type: 'floor', parentId: 'frontier-tower' },
  { id: 'room-301', name: 'Suite 301 - "Innovate"', type: 'room', parentId: 'floor-3' },
  { id: 'room-302', name: 'Suite 302 - "Create"', type: 'room', parentId: 'floor-3' },
  { id: 'floor-10', name: 'Rooftop Terrace', type: 'floor', parentId: 'frontier-tower' },
  { id: 'room-1001', name: 'Sky Lounge', type: 'room', parentId: 'floor-10' },
  { id: 'room-1002', name: 'Outdoor Terrace', type: 'room', parentId: 'floor-10' },
];

const mockEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Tech Summit Keynote',
    description: 'Join us for the opening keynote of the annual Tech Summit, featuring industry leaders and groundbreaking announcements.',
    startsAt: formatISO(addHours(now, 2)),
    endsAt: formatISO(addHours(now, 4)),
    location: { roomId: 'room-102' },
  },
  {
    id: 'evt-2',
    title: 'AI Workshop',
    description: 'A hands-on workshop exploring the latest trends and techniques in Artificial Intelligence. Laptops required.',
    startsAt: formatISO(addHours(now, 5)),
    endsAt: formatISO(addHours(now, 8)),
    location: { roomId: 'room-103' },
  },
  {
    id: 'evt-3',
    title: 'Networking Mixer',
    description: 'An informal gathering for attendees to connect and network. Refreshments will be served.',
    startsAt: formatISO(addHours(now, 9)),
    endsAt: formatISO(addHours(now, 11)),
    location: { roomId: 'room-101' },
  },
    {
    id: 'evt-4',
    title: 'Startup Pitch Day',
    description: 'Watch the most promising startups pitch their ideas to a panel of venture capitalists.',
    startsAt: formatISO(addDays(now, 1)),
    endsAt: formatISO(addHours(addDays(now, 1), 6)),
    location: { roomId: 'room-301' },
  },
  {
    id: 'evt-5',
    title: 'Design Thinking Seminar',
    description: 'Learn the principles of design thinking and how to apply them to your projects.',
    startsAt: formatISO(addDays(now, 2)),
    endsAt: formatISO(addHours(addDays(now, 2), 3)),
    location: { roomId: 'room-302' },
  },
  {
    id: 'evt-6',
    title: 'Rooftop Yoga',
    description: 'Start your day with a refreshing yoga session on our scenic rooftop terrace.',
    startsAt: formatISO(subDays(now, 1)),
    endsAt: formatISO(addHours(subDays(now, 1), 1)),
    location: { roomId: 'room-1002' },
  },
   {
    id: 'evt-7',
    title: 'All-day Hackathon',
    description: 'A 24-hour hackathon to build innovative solutions. Prizes for the best projects.',
    startsAt: formatISO(subDays(now, 3)),
    endsAt: formatISO(subDays(now, 2)),
    location: { roomId: 'room-201' },
  },
];


export async function getRooms(): Promise<Room> {
  const rooms: Room[] = JSON.parse(JSON.stringify(rawRooms));
  const roomMap = new Map(rooms.map(room => [room.id, room]));
  const tree: Room[] = [];

  rooms.forEach(room => {
    if (room.parentId) {
      const parent = roomMap.get(room.parentId);
      if (parent) {
        (parent.children = parent.children || []).push(room);
      }
    } else {
      tree.push(room);
    }
  });

  return tree[0]; 
}

export async function getEvents(): Promise<Event[]> {
  // In a real application, you would fetch from the external API:
  // const apiKey = process.env.FRONTIER_TOWER_API_KEY;
  // if (!apiKey) throw new Error("API key is not configured.");
  // const response = await fetch('https://api.berlinhouse.com/events/', {
  //   headers: {
  //     'Authorization': `Bearer ${apiKey}`
  //   }
  // });
  // if (!response.ok) throw new Error("Failed to fetch events from external API.");
  // const events = await response.json();
  // return events;

  // For demonstration, we return mock data.
  return Promise.resolve(mockEvents);
}
