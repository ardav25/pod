import Header from "@/components/layout/Header";
import ProductionPlanner from "@/components/production/ProductionPlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GanttChartSquare, Users, FileText, Package } from "lucide-react";
import db from "@/lib/db";

async function getProductionStats() {
    const activeWorkOrders = await db.workOrder.count({
        where: {
            OR: [
                { status: "Needs Production" },
                { status: "In Progress" },
            ]
        }
    });

    const unitsToProduce = await db.workOrder.aggregate({
        _sum: {
            quantity: true,
        },
        where: {
            OR: [
                { status: "Needs Production" },
                { status: "In Progress" },
            ]
        }
    });

    const subcontractingJobs = await db.workOrder.count({
        where: {
            subcontract: true,
            status: {
                notIn: ["Completed", "Canceled"],
            }
        }
    });

    return {
        activeWorkOrders,
        unitsToProduce: unitsToProduce._sum.quantity ?? 0,
        subcontractingJobs,
    };
}


export default async function ProductionPage() {
  const stats = await getProductionStats();

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Manufacturing Dashboard</h1>
          <p className="text-muted-foreground">Monitor, plan, and analyze all production activities.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Work Orders
              </CardTitle>
              <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                In production queue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units to Produce</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unitsToProduce}</div>
              <p className="text-xs text-muted-foreground">
                Across all active orders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subcontracting Jobs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subcontractingJobs}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting vendor processing
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Available reports to generate
              </p>
            </CardContent>
          </Card>
        </div>

        <ProductionPlanner />
      </main>
    </div>
  );
}
