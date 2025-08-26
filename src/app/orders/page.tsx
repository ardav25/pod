"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// This type should match the structure of the data returned by your API
// which is based on the Firestore document structure.
interface Order {
  id: string;
  customerName: string | null;
  createdAt: string; // ISO string from Firestore timestamp
  status: string;
  total: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Order[] = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        // Handle the error appropriately in the UI
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Processing':
        return 'default';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default'; // Consider a green variant
      case 'Canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>A list of all customer orders from the database.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                      <TableCell>{order.customerName || `Customer #${order.id.substring(0, 5)}`}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders found.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
