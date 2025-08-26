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
import db from "@/lib/db"; // Assuming this will be used for status updates eventually via server actions

type ProductionStatus =
  | "Needs Production"
  | "In Progress"
  | "Completed"
  | "Canceled"
  | "Subcontracted";

// This type must match the data structure returned by the /api/work-orders endpoint
interface WorkOrderItem {
  id: string;
  orderId: string;
  productName: string;
  productColor: string;
  productSize: string;
  designDataUri: string;
  quantity: number;
  status: ProductionStatus;
  createdAt: string; // Dates are serialized as strings
  isSubcontract: boolean;
}

const statusVariants: { [key in ProductionStatus]: { variant: "default" | "secondary" | "outline" | "destructive", className: string } } = {
  "Needs Production": { variant: "secondary", className: 'bg-yellow-100 text-yellow-800' },
  "In Progress": { variant: "outline", className: 'bg-blue-100 text-blue-800' },
  "Completed": { variant: "default", className: 'bg-green-100 text-green-800' },
  "Canceled": { variant: "destructive", className: '' },
  "Subcontracted": { variant: "default", className: 'bg-purple-100 text-purple-800' },
};

export default function ProductionPlanner() {
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBomOpen, setBomOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrderItem | null>(null);

  useEffect(() => {
    async function fetchWorkOrders() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/work-orders');
        if (!response.ok) {
          throw new Error('Failed to fetch work orders');
        }
        const data: WorkOrderItem[] = await response.json();
        // Sort by creation date, descending
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setWorkOrders(data);
      } catch (error) {
        console.error("Error fetching work orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkOrders();
  }, []);


  const handleStatusChange = async (itemId: string, newStatus: ProductionStatus) => {
    // This needs to be implemented, likely via a server action or a PUT request to an API endpoint
    console.log(`Updating item ${itemId} to status ${newStatus}`);
    // Optimistically update the UI
    setWorkOrders(workOrders.map(wo => wo.id === itemId ? { ...wo, status: newStatus } : wo));
    // Example: await updateWorkOrderStatus(itemId, newStatus);
  };

  const handleViewBom = (item: WorkOrderItem) => {
    setSelectedItem(item);
    setBomOpen(true);
  };
  
  const itemsToPrint = workOrders.filter(item => item.status === 'Needs Production' || item.status === 'In Progress');

  const materialRequirements = useMemo(() => {
    const itemsForProduction = workOrders.filter(
      item => item.status === 'Needs Production' && !item.isSubcontract
    );
    const reqs: { [key: string]: number } = {};
    itemsForProduction.forEach(item => {
      const key = `${item.productName} - ${item.productColor}`;
      if (!reqs[key]) {
        reqs[key] = 0;
      }
      reqs[key] += item.quantity;
    });
    return Object.entries(reqs).map(([name, quantity]) => ({ name, quantity }));
  }, [workOrders]);

  const subcontractingItems = useMemo(() => {
     return workOrders.filter(item => item.isSubcontract && item.status !== 'Completed' && item.status !== 'Canceled');
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
                  Manage and track individual production work orders in real-time.
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
                     {workOrders.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">WO-#{item.id.substring(0, 7)}</TableCell>
                          <TableCell>
                             <div className="flex items-center gap-3">
                                <Image
                                    src={item.designDataUri}
                                    alt="Design"
                                    width={40}
                                    height={40}
                                    className="rounded-md bg-white object-contain p-1 border"
                                />
                                <div>
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-sm text-muted-foreground">{item.productColor}, {item.productSize}</div>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.isSubcontract ? <Badge variant="outline">Subcontracted</Badge> : "In-house"}
                          </TableCell>
                          <TableCell>
                            <Select value={item.status} onValueChange={(newStatus) => handleStatusChange(item.id, newStatus as ProductionStatus)}>
                                <SelectTrigger className={`w-40 text-xs ${statusVariants[item.status].className}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(statusVariants).map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                             <Button variant="outline" size="sm" onClick={() => handleViewBom(item)}>
                                <FileText className="mr-2 h-3 w-3" /> BOM
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                     <GanttChartSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                     <h3 className="mt-2 text-sm font-medium text-muted-foreground">No work orders</h3>
                     <p className="mt-1 text-sm text-gray-500">New orders will appear here automatically.</p>
                  </div>
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
                  {materialRequirements.map(req => (
                     <div key={req.name} className="flex justify-between items-center">
                        <span className="text-sm">{req.name}</span>
                        <Badge variant="secondary">{req.quantity} units</Badge>
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
                <div className="space-y-4">
                  {subcontractingItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                       <div>
                         <p className="text-sm font-medium">WO-#{item.id.substring(0,7)}</p>
                         <p className="text-xs text-muted-foreground">{item.productName} ({item.productColor})</p>
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
            <AlertDialogTitle>Bill of Materials (BOM) for WO-#{selectedItem?.id.substring(0,7)}</AlertDialogTitle>
            <AlertDialogDescription>
              A simplified Bill of Materials for this work order.
              {selectedItem?.isSubcontract && <div className="mt-2 p-2 bg-purple-50 border-l-4 border-purple-400 text-purple-700">This item involves a subcontracting process.</div>}
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
                {selectedItem && (
                  <>
                    <TableRow>
                      <TableCell>{selectedItem.productName} ({selectedItem.productColor}, {selectedItem.productSize})</TableCell>
                      <TableCell>Garment</TableCell>
                      <TableCell className="text-right">{selectedItem.quantity}</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Printing Ink</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell className="text-right">As needed</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Labor</TableCell>
                      <TableCell>Operation</TableCell>
                      <TableCell className="text-right">~5 mins</TableCell>
                    </TableRow>
                    {selectedItem.isSubcontract && (
                       <TableRow>
                        <TableCell>Specialty Foil Application</TableCell>
                        <TableCell>Subcontracting</TableCell>
                        <TableCell className="text-right">{selectedItem.quantity}</TableCell>
                      </TableRow>
                    )}
                  </>
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
