"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Printer, Shirt, SquareGanttChart } from "lucide-react";

// Mock Data
const mockProductionItems = [
  {
    id: "prod-001",
    orderId: "ORD-12346",
    product: "T-shirt Hitam",
    designId: "des-abc",
    designPreview: "https://picsum.photos/seed/design1/100/100",
    quantity: 2,
    size: "L",
    status: "Needs Production",
  },
  {
    id: "prod-002",
    orderId: "ORD-12346",
    product: "T-shirt Putih",
    designId: "des-def",
    designPreview: "https://picsum.photos/seed/design2/100/100",
    quantity: 1,
    size: "M",
    status: "Needs Production",
  },
  {
    id: "prod-003",
    orderId: "ORD-12347",
    product: "T-shirt Merah",
    designId: "des-ghi",
    designPreview: "https://picsum.photos/seed/design3/100/100",
    quantity: 1,
    size: "XL",
    status: "In Progress",
  },
    {
    id: "prod-006",
    orderId: "ORD-12349",
    product: "T-shirt Hitam",
    designId: "des-xyz",
    designPreview: "https://picsum.photos/seed/design6/100/100",
    quantity: 5,
    size: "M",
    status: "Needs Production",
  },
  {
    id: "prod-004",
    orderId: "ORD-12345",
    product: "T-shirt Navy",
    designId: "des-jkl",
    designPreview: "https://picsum.photos/seed/design4/100/100",
    quantity: 3,
    size: "S",
    status: "Completed",
  },
  {
    id: "prod-005",
    orderId: "ORD-12348",
    product: "T-shirt Heather Grey",
    designId: "des-mno",
    designPreview: "https://picsum.photos/seed/design5/100/100",
    quantity: 5,
    size: "XXL",
    status: "Canceled",
  },
];

type ProductionStatus =
  | "Needs Production"
  | "In Progress"
  | "Completed"
  | "Canceled";

const statusVariants: { [key in ProductionStatus]: { variant: "default" | "secondary" | "outline" | "destructive", className: string } } = {
  "Needs Production": { variant: "secondary", className: 'bg-yellow-100 text-yellow-800' },
  "In Progress": { variant: "outline", className: 'bg-blue-100 text-blue-800' },
  "Completed": { variant: "default", className: 'bg-green-100 text-green-800' },
  "Canceled": { variant: "destructive", className: '' },
};


export default function ProductionPlanner() {
  const [productionItems, setProductionItems] = useState(mockProductionItems);

  const handleStatusChange = (itemId: string, newStatus: ProductionStatus) => {
    setProductionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };
  
  const itemsToPrint = productionItems.filter(item => item.status === 'Needs Production' || item.status === 'In Progress');

  const materialRequirements = useMemo(() => {
    const requirements: { [key: string]: { [key: string]: number } } = {};
    const itemsForProduction = productionItems.filter(
      (item) => item.status === "Needs Production"
    );

    itemsForProduction.forEach((item) => {
      if (!requirements[item.product]) {
        requirements[item.product] = {};
      }
      if (!requirements[item.product][item.size]) {
        requirements[item.product][item.size] = 0;
      }
      requirements[item.product][item.size] += item.quantity;
    });

    return Object.entries(requirements);
  }, [productionItems]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl inline-flex items-center gap-2">
                <SquareGanttChart className="h-6 w-6"/>
                Production Queue
              </CardTitle>
              <CardDescription>
                Manage and track items that need to be produced.
              </CardDescription>
            </div>
            <Button disabled={itemsToPrint.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Print Production List ({itemsToPrint.length})
            </Button>
          </CardHeader>
          <CardContent>
            {productionItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Design</TableHead>
                    <TableHead>Qty</TableHead>
                     <TableHead>Size</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.orderId}
                      </TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>
                        <Image
                          src={item.designPreview}
                          alt={`Preview for ${item.designId}`}
                          width={40}
                          height={40}
                          className="rounded-md object-cover bg-slate-100"
                          data-ai-hint="t-shirt design"
                        />
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                       <TableCell>
                        <Badge variant="outline">{item.size}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(newStatus: ProductionStatus) =>
                            handleStatusChange(item.id, newStatus)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue asChild>
                              <Badge 
                                variant={statusVariants[item.status].variant}
                                className={`${statusVariants[item.status].className} hover:bg-opacity-80 w-full justify-start`}
                              >
                                {item.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(statusVariants).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No items in production queue.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-2xl inline-flex items-center gap-2">
              <Shirt className="h-6 w-6"/>
              Material Requirements
            </CardTitle>
            <CardDescription>
              T-shirts needed for items in "Needs Production".
            </CardDescription>
          </CardHeader>
          <CardContent>
             {materialRequirements.length > 0 ? (
              <div className="space-y-4">
                {materialRequirements.map(([product, sizes]) => (
                  <div key={product}>
                    <h4 className="font-semibold">{product}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Size</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(sizes).map(([size, quantity]) => (
                          <TableRow key={size}>
                            <TableCell>{size}</TableCell>
                            <TableCell className="text-right">{quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No materials required. All items are in production or completed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
