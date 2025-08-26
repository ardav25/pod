import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const workOrders = await db.workOrder.findMany({
      include: {
        product: true, // Include the related product information
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error('[API_WORK_ORDERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
