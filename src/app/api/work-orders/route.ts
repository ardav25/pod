import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface WorkOrder {
  id: string;
  [key: string]: any;
}

export async function GET() {
  try {
    const workOrdersCollectionRef = collection(db, 'work-orders');
    const q = query(workOrdersCollectionRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const workOrders: WorkOrder[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error('[API_WORK_ORDERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
