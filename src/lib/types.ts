export interface Room {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'room';
  parentId: string | null;
  children?: Room[];
}

export type EventSource = 'frontier-tower' | 'luma' | 'mock';

export interface Event {
  id: string;
  name: string;
  description: string;
  host: string;
  startsAt: string; // ISO 8601 string
  endsAt: string; // ISO 8601 string
  location: string;
  originalLocation: string;
  color?: string;
  source: EventSource;
  rawJson: string;
}
