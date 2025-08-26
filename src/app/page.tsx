import Header from "@/components/layout/Header";
import DesignStudio from "@/components/print-stream/DesignStudio";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Header />
      <div className="flex-grow p-4 md:p-8">
        <DesignStudio />
      </div>
    </div>
  );
}
