import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API_ORDERS_GET]', error);
    // It's good practice to not expose detailed error messages to the client
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
