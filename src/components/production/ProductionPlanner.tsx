"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Printer, Shirt, GanttChartSquare, FileText, Users, AlertCircle, Loader2 } from "lucide-react";
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
import type { WorkOrder, Product } from "@prisma/client";

// Define an extended type for the client-side
type WorkOrderItem = WorkOrder & { product: Product };

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
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBomOpen, setBomOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrderItem | null>(null);

  useEffect(() => {
    async function fetchWorkOrders() {
      try {
        const res = await fetch('/api/work-orders');
        if (!res.ok) {
            throw new Error('Failed to fetch work orders');
        }
        const data = await res.json();
        setWorkOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkOrders();
  }, []);


  const handleStatusChange = (itemId: string, newStatus: ProductionStatus) => {
    setWorkOrders((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
    // Here you would typically also make an API call to update the status in the database
  };

  const handleViewBom = (item: WorkOrderItem) => {
    setSelectedItem(item);
    setBomOpen(true);
  };
  
  const itemsToPrint = workOrders.filter(item => item.status === 'Needs Production' || item.status === 'In Progress');

  const materialRequirements = useMemo(() => {
    const requirements: { [key: string]: { [key: string]: number } } = {};
    const itemsForProduction = workOrders.filter(
      (item) => item.status === "Needs Production"
    );

    itemsForProduction.forEach((item) => {
      const materialKey = item.product.name.split(" ")[0] + " Blank"; // e.g. "T-shirt Blank"
      if (!requirements[materialKey]) {
        requirements[materialKey] = {};
      }
      if (!requirements[materialKey][item.size]) {
        requirements[materialKey][item.size] = 0;
      }
      requirements[materialKey][item.size] += item.quantity;
    });

    return Object.entries(requirements);
  }, [workOrders]);

  const subcontractingItems = useMemo(() => {
    return workOrders.filter(
      (item) => item.subcontract && item.status !== "Completed" && item.status !== "Canceled"
    );
  }, [workOrders]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

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
                    {workOrders.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.id.toUpperCase().substring(0, 8)}
                          <p className="text-xs text-muted-foreground">{item.orderId.toUpperCase().substring(0, 8)}</p>
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
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">Design: {item.designId}</p>
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
                                  variant={statusVariants[item.status as ProductionStatus].variant}
                                  className={`${statusVariants[item.status as ProductionStatus].className} hover:bg-opacity-80 w-full justify-start`}
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
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.id.toUpperCase().substring(0,8)} - {item.quantity} units</p>
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
            <AlertDialogTitle>Bill of Materials (BOM) for {selectedItem?.id.toUpperCase().substring(0,8)}</AlertDialogTitle>
            <AlertDialogDescription>
              This is a simplified Bill of Materials for producing {selectedItem?.quantity} unit(s) of {selectedItem?.product.name} ({selectedItem?.size}).
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
                  <TableCell className="font-medium">{selectedItem?.product.name} Blank ({selectedItem?.size})</TableCell>
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
