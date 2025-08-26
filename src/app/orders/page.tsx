import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  {
    id: "ORD001",
    customer: "Liam Johnson",
    date: "2023-10-23",
    status: "Fulfilled",
    total: "$250.00",
  },
  {
    id: "ORD002",
    customer: "Olivia Smith",
    date: "2023-10-24",
    status: "Processing",
    total: "$150.00",
  },
  {
    id: "ORD003",
    customer: "Noah Williams",
    date: "2023-10-25",
    status: "Fulfilled",
    total: "$350.00",
  },
    {
    id: "ORD004",
    customer: "Emma Brown",
    date: "2023-10-26",
    status: "Shipped",
    total: "$450.00",
  },
    {
    id: "ORD005",
    customer: "Ava Jones",
    date: "2023-10-27",
    status: "Pending",
    total: "$550.00",
  },
];


export default function OrdersPage() {
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'Fulfilled' ? 'default' : 
                          order.status === 'Processing' ? 'secondary' :
                          order.status === 'Shipped' ? 'outline' :
                          'destructive'
                        }
                        className={
                          order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' : ''
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
