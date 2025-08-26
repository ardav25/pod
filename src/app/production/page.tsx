import Header from "@/components/layout/Header";
import ProductionPlanner from "@/components/production/ProductionPlanner";

export default async function ProductionPage() {

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Manufacturing Dashboard</h1>
          <p className="text-muted-foreground">Monitor, plan, and analyze all production activities in real-time.</p>
        </div>
        <ProductionPlanner />
      </main>
    </div>
  );
}
