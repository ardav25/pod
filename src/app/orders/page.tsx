import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import db from "@/lib/db";
import { format } from "date-fns";

async function getOrders() {
  const orders = await db.order.findMany({
    orderBy: {
      createdAt: 'desc',
    }
  });
  return orders;
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>A list of your recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
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
                      <TableCell className="font-medium">{order.id.substring(0, 7).toUpperCase()}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{format(order.createdAt, "PPP")}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.status === 'Fulfilled' ? 'default' : 
                            order.status === 'Processing' ? 'secondary' :
                            order.status === 'Shipped' ? 'outline' :
                            'destructive'
                          }
                          className={
                            order.status === 'Fulfilled' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
                          }
                        >
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
