import Header from "@/components/layout/Header";
import ProductionPlanner from "@/components/production/ProductionPlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GanttChartSquare, Users, FileText, Package } from "lucide-react";


export default async function ProductionPage() {

  // This data will now be fetched and calculated within ProductionPlanner client component
  // We keep the shell here for Server-Side-Rendering layout.

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Manufacturing Dashboard</h1>
          <p className="text-muted-foreground">Monitor, plan, and analyze all production activities in real-time.</p>
        </div>

        {/* The summary cards will also be handled by the client component to show live data */}

        <ProductionPlanner />
      </main>
    </div>
  );
}
