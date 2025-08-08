export interface Room {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'room';
  parentId: string | null;
  children?: Room[];
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startsAt: string; // ISO 8601 string
  endsAt: string; // ISO 8601 string
  location: string;
}
