import type { Room } from './types';

export const rooms: Room = {
  id: 'frontier-tower',
  name: 'Frontier Tower',
  type: 'building',
  parentId: null,
  children: [
    {
      id: 'floor-0',
      name: 'Floor 0 - Basement',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f0r1', name: 'Main Room', type: 'room', parentId: 'floor-0' },
        { id: 'f0r2', name: 'Storage A', type: 'room', parentId: 'floor-0' },
        { id: 'f0r3', name: 'Garage', type: 'room', parentId: 'floor-0' },
      ],
    },
    {
      id: 'floor-1',
      name: 'Floor 1 - Lobby & Amenities',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f1r1', name: 'Lobby', type: 'room', parentId: 'floor-1' },
        { id: 'f1r2', name: 'Gym', type: 'room', parentId: 'floor-1' },
        { id: 'f1r3', name: 'Pool', type: 'room', parentId: 'floor-1' },
        { id: 'f1r4', name: 'Business Center', type: 'room', parentId: 'floor-1' },
      ],
    },
    {
      id: 'floor-2',
      name: 'Floor 2 - Conference',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'floor_2', name: 'Floor 2', type: 'room', parentId: 'floor-2' },
        { id: 'f2r1', name: 'Conference Room Alpha', type: 'room', parentId: 'floor-2' },
        { id: 'f2r2', name: 'Conference Room Beta', type: 'room', parentId: 'floor-2' },
        { id: 'f2r3', name: 'Breakout Zone 1', type: 'room', parentId: 'floor-2' },
        { id: 'f2r4', name: 'Breakout Zone 2', type: 'room', parentId: 'floor-2' },
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
        id: 'floor-16',
        name: 'Floor 16 - Lounge',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'floor_16', name: 'Floor 16', type: 'room', parentId: 'floor-16' },
          { id: 'f16r0', name: 'Lounge', type: 'room', parentId: 'floor-16' },
          { id: 'f16r2', name: 'Observatory Deck', type: 'room', parentId: 'floor-16' },
        ]
    }
  ],
};
