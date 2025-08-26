import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { DollarSign, Package, Palette } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import db from "@/lib/db";

async function getRecentOrders() {
    const orders = await db.order.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc',
        },
    });
    return orders;
}

export default async function DashboardPage() {
  const recentOrders = await getRecentOrders();

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's a summary of your store.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,299.30</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+235</div>
              <p className="text-xs text-muted-foreground">
                +18.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Designs
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 since last week
              </p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
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
                    {recentOrders.map((order) => (
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
                <p className="text-muted-foreground text-center py-8">No recent orders found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
