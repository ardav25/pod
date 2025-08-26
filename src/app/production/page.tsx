import Header from "@/components/layout/Header";
import ProductionPlanner from "@/components/production/ProductionPlanner";

export default function ProductionPage() {
  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <ProductionPlanner />
      </main>
    </div>
  );
}
