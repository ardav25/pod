import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workOrders } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allWorkOrders = await db.select().from(workOrders).orderBy(asc(workOrders.createdAt));
    return NextResponse.json(allWorkOrders);
  } catch (error) {
    console.error('[API_WORK_ORDERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
