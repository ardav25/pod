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

// This will be replaced with Firestore types
type WorkOrderItem = any;
type Product = any;

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
    // We will fetch from Firestore here later
    setWorkOrders([]);
    setIsLoading(false);
  }, []);


  const handleStatusChange = (itemId: string, newStatus: ProductionStatus) => {
    // Logic to update Firestore will be here
  };

  const handleViewBom = (item: WorkOrderItem) => {
    setSelectedItem(item);
    setBomOpen(true);
  };
  
  const itemsToPrint = workOrders.filter(item => item.status === 'Needs Production' || item.status === 'In Progress');

  const materialRequirements = useMemo(() => {
    // This will be calculated from Firestore data
    return [];
  }, [workOrders]);

  const subcontractingItems = useMemo(() => {
    // This will be calculated from Firestore data
    return [];
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
              {workOrders.length > 0 ? (
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
                      {/* Data will be mapped from Firestore */}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No work orders found.</p>
                )
              }
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
                  {/* Material data will be mapped here */}
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
                  {/* Subcontracting data will be mapped here */}
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
            <AlertDialogTitle>Bill of Materials (BOM)</AlertDialogTitle>
            <AlertDialogDescription>
              A simplified Bill of Materials.
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
                {/* BOM data will be populated here */}
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
