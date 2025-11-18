import type { Room } from './types';

export const rooms: Room = {
  id: 'frontier-tower',
  name: 'Frontier Tower',
  type: 'building',
  parentId: null,
  children: [
    {
      id: 'f0',
      name: '0 - Basement',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f0r1', name: 'Robot Arena', type: 'room', parentId: 'f0' },
        { id: 'f0r2', name: 'Storage A', type: 'room', parentId: 'f0' },
        { id: 'f0r3', name: 'Garage', type: 'room', parentId: 'f0' },
      ],
    },
    {
      id: 'f1',
      name: '1 - Lobby',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'f1r1', name: 'Lobby', type: 'room', parentId: 'f1' },
      ],
    },
    {
      id: 'f2',
      name: '2 - Events',
      type: 'floor',
      parentId: 'frontier-tower',
      children: [
        { id: 'spaceship', name: 'Spaceship', type: 'room', parentId: 'f2' },
        { id: '2nd-floor-conference-a', name: 'Conference Room A', type: 'room', parentId: 'f2' },
        { id: '2nd-floor-conference-b', name: 'Conference Room B', type: 'room', parentId: 'f2' },
        { id: '2nd-floor-conference-c', name: 'Conference Room C', type: 'room', parentId: 'f2' },
        { id: '2nd-floor-conference-d', name: 'Conference Room D', type: 'room', parentId: 'f2' },
      ],
    },
    {
        id: 'f3',
        name: '3 - Offices',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
            { id: 'f3r1', name: 'Offices Bar', type: 'room', parentId: 'f3' },
        ]
    },
    {
        id: 'f4',
        name: '4 - Robotics & Hard Tech',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f6',
        name: '6 - Arts & Music',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f7',
        name: '7 - Makerspace',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f8',
        name: '8 - Biotech',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f9',
        name: '9 - AI & Autonomous Systems',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'f9-annex', name: '9th Floor Annex', type: 'room', parentId: 'f9' },
        ]
    },
    {
        id: 'f10',
        name: '10 - Accelerate',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f11',
        name: '11 - Longevity & Health',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'f11r1', name: '11th Floor Annex', type: 'room', parentId: 'f11' },
        ]
    },
    {
        id: 'f12',
        name: '12 - Ethereum House',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
        ]
    },
    {
        id: 'f14',
        name: '14 - Human Flourishing',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: '14th-kitchen', name: 'Kitchen', type: 'room', parentId: 'f14' },
          { id: '14th-salon', name: 'Salon', type: 'room', parentId: 'f14' },
        ]
    },
    {
        id: 'f15',
        name: '15 - Coworking',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
            { id: '15th-deep-work-space', name: 'Deep Work Space', type: 'room', parentId: 'f15' },
            { id: '15th-blue-room', name: 'Blue Room', type: 'room', parentId: 'f15' },
        ]
    },
    {
        id: 'f16',
        name: '16 - d/acc',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'rooftop-lounge', name: 'Lounge', type: 'room', parentId: 'f16' },
          { id: '16th-coffee-meetup', name: 'Coffee Meetup', type: 'room', parentId: 'f16' },
          { id: '16th-breakout-l', name: 'Left Breakout', type: 'room', parentId: 'f16' },
          { id: '16th-breakout-r', name: 'Right Breakout', type: 'room', parentId: 'f16' },
          { id: '16th-corner-lobby', name: 'Corner Lobby', type: 'room', parentId: 'f16' },
        ]
    },
    {
        id: 'f17',
        name: '17 - Rooftop',
        type: 'floor',
        parentId: 'frontier-tower',
        children: [
          { id: 'f17r1', name: 'BBQ', type: 'room', parentId: 'f17' },
          { id: 'f17r2', name: 'Rave', type: 'room', parentId: 'f17' },
        ]
    }
  ],
};
