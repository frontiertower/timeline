import { rooms } from '@/lib/rooms';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(rooms);
}
