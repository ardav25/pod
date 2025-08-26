"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { DollarSign, Package, Palette, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

// Assuming a type definition for Order based on your Firestore structure
interface Order {
  id: string;
  customerName: string | null;
  createdAt: string; // ISO string
  status: string;
  total: number;
}

interface DashboardStats {
    totalRevenue: number;
    orderCount: number;
    designCount: number; // Placeholder
}

export default function DashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const allOrders: Order[] = await response.json();

        // Data is already sorted by date from the API
        setRecentOrders(allOrders.slice(0, 5));

        // Calculate stats
        let totalRevenue = 0;
        allOrders.forEach(order => {
            totalRevenue += order.total;
        });

        setStats({
            totalRevenue: totalRevenue,
            orderCount: allOrders.length,
            designCount: 0, // Placeholder
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Processing': return 'default';
      case 'Shipped': return 'outline';
      case 'Delivered': return 'default';
      case 'Canceled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's a summary of your store.</p>
        </div>
        {isLoading || !stats ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><CardTitle><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="h-10"></div></CardContent></Card>
                <Card><CardHeader><CardTitle><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="h-10"></div></CardContent></Card>
                <Card><CardHeader><CardTitle><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="h-10"></div></CardContent></Card>
             </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {stats.orderCount} orders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orderCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Total orders placed
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
                  <div className="text-2xl font-bold">{stats.designCount}</div>
                  <p className="text-xs text-muted-foreground">
                    (Coming soon)
                  </p>
                </CardContent>
              </Card>
            </div>
        )}
         <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
              ) : recentOrders.length > 0 ? (
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
                            <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
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
                <p className="text-muted-foreground text-center py-8">No recent orders found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
