"use client";

import { useState } from "react";
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
import { Printer } from "lucide-react";

// Mock Data
const mockProductionItems = [
  {
    id: "prod-001",
    orderId: "ORD-12346",
    product: "T-shirt Hitam",
    designId: "des-abc",
    designPreview: "https://picsum.photos/seed/design1/100/100",
    quantity: 2,
    status: "Needs Production",
  },
  {
    id: "prod-002",
    orderId: "ORD-12346",
    product: "T-shirt Putih",
    designId: "des-def",
    designPreview: "https://picsum.photos/seed/design2/100/100",
    quantity: 1,
    status: "Needs Production",
  },
  {
    id: "prod-003",
    orderId: "ORD-12347",
    product: "T-shirt Merah",
    designId: "des-ghi",
    designPreview: "https://picsum.photos/seed/design3/100/100",
    quantity: 1,
    status: "In Progress",
  },
  {
    id: "prod-004",
    orderId: "ORD-12345",
    product: "T-shirt Navy",
    designId: "des-jkl",
    designPreview: "https://picsum.photos/seed/design4/100/100",
    quantity: 3,
    status: "Completed",
  },
  {
    id: "prod-005",
    orderId: "ORD-12348",
    product: "T-shirt Heather Grey",
    designId: "des-mno",
    designPreview: "https://picsum.photos/seed/design5/100/100",
    quantity: 5,
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Production Planning</CardTitle>
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
                <TableHead>Quantity</TableHead>
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
  );
}