"use server";

import { z } from "zod";
import db from "@/lib/db";

const createOrderSchema = z.object({
  productId: z.string(),
  designDataUri: z.string(),
  color: z.string(),
  size: z.string(),
  price: z.number(),
});

type Result = {
  success: boolean;
  orderId?: string;
  error?: string;
};

// A simplified function to determine if an item needs subcontracting
function needsSubcontracting(color: string, size: string): boolean {
    // Example logic: All XXL shirts or special colors are subcontracted
    return size === "XXL" || color === "Red";
}


export async function createOrderAction(
  values: z.infer<typeof createOrderSchema>
): Promise<Result> {
  const validatedFields = createOrderSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input.",
    };
  }

  try {
    const { productId, designDataUri, color, size, price } = validatedFields.data;
    
    // Using a transaction to ensure both order and work order are created
    const newOrder = await db.$transaction(async (prisma) => {
        // 1. Create the Order document
        const order = await prisma.order.create({
            data: {
                customerName: "Demo Customer", // In a real app, this would come from auth
                status: "Pending",
                total: price,
                items: {
                    create: {
                        productId: productId,
                        color: color,
                        size: size,
                        quantity: 1,
                    }
                }
            },
            include: {
                items: true,
            }
        });

        console.log("Order created with ID: ", order.id);

        // 2. Create the corresponding Work Order document
        const workOrder = await prisma.workOrder.create({
            data: {
                orderId: order.id,
                productName: "T-Shirt",
                productColor: color,
                productSize: size,
                designDataUri: designDataUri,
                quantity: 1, // For simplicity, each order is for 1 item
                status: "Needs Production",
                isSubcontract: needsSubcontracting(color, size),
            }
        });

        console.log("Work Order created with ID: ", workOrder.id);
        
        return order;
    });


    return { success: true, orderId: newOrder.id };

  } catch (e) {
    console.error("Error creating order: ", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to create order: ${errorMessage}`,
    };
  }
}
