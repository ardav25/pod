import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const mockOrders = [
  {
    id: 'ord-12345',
    customer: 'Alice Johnson',
    createdAt: new Date(),
    status: 'Fulfilled',
    total: 22.5,
  },
  {
    id: 'ord-12346',
    customer: 'Bob Williams',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'Processing',
    total: 45.0,
  },
  {
    id: 'ord-12347',
    customer: 'Charlie Brown',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: 'Shipped',
    total: 18.75,
  },
  {
    id: 'ord-12348',
    customer: 'Diana Miller',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    status: 'Canceled',
    total: 50.2,
  },
];


async function getOrders() {
  // Simulate an async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockOrders;
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
