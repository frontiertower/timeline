import { getRooms } from '@/lib/data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rooms = await getRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch rooms' }, { status: 500 });
  }
}
