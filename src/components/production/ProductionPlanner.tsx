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
import { Printer, Shirt, GanttChartSquare, FileText, Users, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock Data
const mockProductionItems = [
  {
    id: "wo-001",
    orderId: "ORD-12346",
    product: "T-shirt Hitam",
    designId: "des-abc",
    designPreview: "https://picsum.photos/seed/design1/100/100",
    quantity: 2,
    size: "L",
    status: "Needs Production",
    subcontract: false,
  },
  {
    id: "wo-002",
    orderId: "ORD-12346",
    product: "T-shirt Putih",
    designId: "des-def",
    designPreview: "https://picsum.photos/seed/design2/100/100",
    quantity: 1,
    size: "M",
    status: "Needs Production",
    subcontract: false,
  },
  {
    id: "wo-003",
    orderId: "ORD-12347",
    product: "T-shirt Merah",
    designId: "des-ghi",
    designPreview: "https://picsum.photos/seed/design3/100/100",
    quantity: 1,
    size: "XL",
    status: "In Progress",
    subcontract: false,
  },
    {
    id: "wo-004",
    orderId: "ORD-12349",
    product: "T-shirt Hitam",
    designId: "des-xyz",
    designPreview: "https://picsum.photos/seed/design6/100/100",
    quantity: 5,
    size: "M",
    status: "Needs Production",
    subcontract: false,
  },
  {
    id: "wo-005",
    orderId: "ORD-12350",
    product: "Topi Custom Bordir",
    designId: "des-hat1",
    designPreview: "https://picsum.photos/seed/design7/100/100",
    quantity: 10,
    size: "One Size",
    status: "Needs Production",
    subcontract: true,
  },
  {
    id: "wo-006",
    orderId: "ORD-12345",
    product: "T-shirt Navy",
    designId: "des-jkl",
    designPreview: "https://picsum.photos/seed/design4/100/100",
    quantity: 3,
    size: "S",
    status: "Completed",
    subcontract: false,
  },
  {
    id: "wo-007",
    orderId: "ORD-12348",
    product: "T-shirt Heather Grey",
    designId: "des-mno",
    designPreview: "https://picsum.photos/seed/design5/100/100",
    quantity: 5,
    size: "XXL",
    status: "Canceled",
    subcontract: false,
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
  const [isBomOpen, setBomOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(typeof mockProductionItems)[0] | null>(null);

  const handleStatusChange = (itemId: string, newStatus: ProductionStatus) => {
    setProductionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleViewBom = (item: (typeof mockProductionItems)[0]) => {
    setSelectedItem(item);
    setBomOpen(true);
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

  const subcontractingItems = useMemo(() => {
    return productionItems.filter(
      (item) => item.subcontract && item.status !== "Completed" && item.status !== "Canceled"
    );
  }, [productionItems]);


  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl inline-flex items-center gap-2">
                  <GanttChartSquare className="h-6 w-6"/>
                  Work Orders
                </CardTitle>
                <CardDescription>
                  Manage and track individual production work orders.
                </CardDescription>
              </div>
              <Button disabled={itemsToPrint.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print Work Orders ({itemsToPrint.length})
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.id.toUpperCase()}
                          {item.subcontract && <p className="text-xs text-muted-foreground">Subcontracted</p>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={item.designPreview}
                              alt={`Preview for ${item.designId}`}
                              width={40}
                              height={40}
                              className="rounded-md object-cover bg-slate-100"
                              data-ai-hint="t-shirt design"
                            />
                            <div>
                              <p className="font-medium">{item.product}</p>
                              <p className="text-sm text-muted-foreground">{item.orderId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.size}</Badge>
                        </TableCell>
                        <TableCell className="w-[180px]">
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
                        <TableCell>
                           <Button variant="ghost" size="sm" onClick={() => handleViewBom(item)}>
                            View BOM
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl inline-flex items-center gap-2">
                <Shirt className="h-5 w-5"/>
                Material Requirements
              </CardTitle>
              <CardDescription>
                Auto-calculated for items in "Needs Production".
              </CardDescription>
            </CardHeader>
            <CardContent>
               {materialRequirements.length > 0 ? (
                <div className="space-y-4">
                  {materialRequirements.map(([product, sizes]) => (
                    <div key={product}>
                      <h4 className="font-semibold">{product}</h4>
                      <Table>
                        <TableBody>
                          {Object.entries(sizes).map(([size, quantity]) => (
                            <TableRow key={size}>
                              <TableCell>{size}</TableCell>
                              <TableCell className="text-right">{quantity} units</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No materials required.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl inline-flex items-center gap-2">
                <Users className="h-5 w-5"/>
                Subcontracting
              </CardTitle>
               <CardDescription>
                Manage orders sent to external vendors.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {subcontractingItems.length > 0 ? (
                <div className="space-y-2">
                  {subcontractingItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                      <div>
                        <p className="font-semibold">{item.product}</p>
                        <p className="text-sm text-muted-foreground">{item.id.toUpperCase()} - {item.quantity} units</p>
                      </div>
                      <Button size="sm">Create PO</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No items for subcontracting.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={isBomOpen} onOpenChange={setBomOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bill of Materials (BOM) for {selectedItem?.id.toUpperCase()}</AlertDialogTitle>
            <AlertDialogDescription>
              This is a simplified Bill of Materials for producing {selectedItem?.quantity} unit(s) of {selectedItem?.product} ({selectedItem?.size}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{selectedItem?.product} Blank ({selectedItem?.size})</TableCell>
                  <TableCell>Raw Material</TableCell>
                  <TableCell className="text-right">{selectedItem?.quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DTG Printing Ink</TableCell>
                  <TableCell>Consumable</TableCell>
                  <TableCell className="text-right">~{((selectedItem?.quantity ?? 0) * 0.5).toFixed(2)} ml</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Packaging Bag</TableCell>
                  <TableCell>Packaging</TableCell>
                  <TableCell className="text-right">{selectedItem?.quantity}</TableCell>
                </TableRow>
                 {selectedItem?.subcontract && (
                   <TableRow>
                    <TableCell colSpan={3}>
                      <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md inline-flex items-center gap-2 mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>This item's embroidery is handled by a subcontracting vendor.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
