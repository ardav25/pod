import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// Define a type for the order data for better type safety
interface Order {
  id: string;
  [key: string]: any; // Allow other fields
}

export async function GET() {
  try {
    const ordersCollectionRef = collection(db, 'orders');
    const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Firestore timestamps need to be converted to a serializable format (e.g., ISO string)
      createdAt: doc.data().createdAt?.toDate().toISOString(), 
    }));
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API_ORDERS_GET]', error);
    // It's good practice to not expose detailed error messages to the client
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
