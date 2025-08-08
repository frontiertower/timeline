import type { Room } from './types';

export const rooms: Room = {
  id: 'frontier-tower',
  name: 'Frontier Tower',
  type: 'building',
  parentId: null,
  children: [
    {
      id: 'floor-0',
      name: '0 - Basement',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f0r1', name: 'Robot Arena', type: 'room', parentId: 'floor-0' },
        { id: 'f0r2', name: 'Storage A', type: 'room', parentId: 'floor-0' },
        { id: 'f0r3', name: 'Garage', type: 'room', parentId: 'floor-0' },
      ],
    },
    {
      id: 'floor-1',
      name: '1 - Lobby',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f1r1', name: 'Lobby', type: 'room', parentId: 'floor-1' },
      ],
    },
    {
      id: 'floor-2',
      name: '2 - Events',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'floor_2', name: 'Spaceship', type: 'room', parentId: 'floor-2' },
        { id: 'f2r1', name: 'Spaceship', type: 'room', parentId: 'floor-2' },
        { id: 'f2r2', name: 'VIP Room', type: 'room', parentId: 'floor-2' },
      ],
    },
    {
        id: 'floor-3',
        name: 'Floor 3 - Offices',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
            { id: 'f3r1', name: 'Offices Bar', type: 'room', parentId: 'floor-3' },
            { id: 'f3r2', name: 'Offices Deck', type: 'room', parentId: 'floor-3' },
        ]
    },
    {
        id: 'floor-15',
        name: '15 - Coworking',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
            { id: 'f15r1', name: 'Deep Work Space', type: 'room', parentId: 'floor-15' },
            { id: 'f15r2', name: 'Blue Room', type: 'room', parentId: 'floor-15' },
        ]
    },
    {
        id: 'floor-16',
        name: 'Floor 16 - Lounge',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'floor_16', name: 'Floor 16', type: 'room', parentId: 'floor-16' },
          { id: 'f16r1', name: 'Lounge', type: 'room', parentId: 'floor-16' },
          { id: 'f16r2', name: 'Coffee Meetup', type: 'room', parentId: 'floor-16' },
          { id: 'f16r3', name: 'Lounge', type: 'room', parentId: 'floor-16' },
          { id: 'f16r4', name: 'Dining Room', type: 'room', parentId: 'floor-16' },
          { id: 'f16r5', name: 'Cinema Room', type: 'room', parentId: 'floor-16' },
        ]
    },
    {
        id: 'floor-17',
        name: '17 - Rooftop',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'f17r1', name: 'BBQ', type: 'room', parentId: 'floor-17' },
          { id: 'f17r2', name: 'Rave', type: 'room', parentId: 'floor-17' },
        ]
    }
  ],
};
